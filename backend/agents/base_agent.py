from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
import json
import time
from supabase import Client
from enum import Enum

logger = logging.getLogger(__name__)

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    ERROR = "error"
    STOPPED = "stopped"

class BaseAgent(ABC):
    """Base class for all AI marketing agents"""
    
    def __init__(self, agent_id: int, supabase_client: Client, config: Dict[str, Any] = None):
        self.agent_id = agent_id
        self.supabase = supabase_client
        self.config = config or {}
        self.logger = logging.getLogger(f"{self.__class__.__name__}_{agent_id}")
        self.status = AgentStatus.IDLE
        
    @abstractmethod
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a specific task. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types. Must be implemented by subclasses."""
        pass
    
    async def update_agent_status(self, status: AgentStatus):
        """Update agent status in database"""
        try:
            self.status = status
            update_data = {
                "status": status.value,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if status == AgentStatus.RUNNING:
                update_data["last_run_at"] = datetime.utcnow().isoformat()
            
            self.supabase.table("agents").update(update_data).eq("id", self.agent_id).execute()
            self.logger.info(f"Agent status updated to {status.value}")
            
        except Exception as e:
            self.logger.error(f"Failed to update agent status: {str(e)}")
    
    async def log_task_start(self, task_id: int, task_type: str, input_data: Dict[str, Any]):
        """Log task start"""
        try:
            self.supabase.table("agent_logs").update({
                "status": TaskStatus.RUNNING.value,
                "started_at": datetime.utcnow().isoformat()
            }).eq("id", task_id).execute()
            
            self.logger.info(f"Task {task_id} ({task_type}) started")
            
        except Exception as e:
            self.logger.error(f"Failed to log task start: {str(e)}")
    
    async def log_task_completion(self, task_id: int, output_data: Dict[str, Any], 
                                execution_time_ms: int):
        """Log successful task completion"""
        try:
            self.supabase.table("agent_logs").update({
                "status": TaskStatus.COMPLETED.value,
                "output_data": output_data,
                "execution_time_ms": execution_time_ms,
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", task_id).execute()
            
            self.logger.info(f"Task {task_id} completed successfully in {execution_time_ms}ms")
            
        except Exception as e:
            self.logger.error(f"Failed to log task completion: {str(e)}")
    
    async def log_task_failure(self, task_id: int, error_message: str, execution_time_ms: int):
        """Log task failure"""
        try:
            self.supabase.table("agent_logs").update({
                "status": TaskStatus.FAILED.value,
                "error_message": error_message,
                "execution_time_ms": execution_time_ms,
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", task_id).execute()
            
            self.logger.error(f"Task {task_id} failed: {error_message}")
            
        except Exception as e:
            self.logger.error(f"Failed to log task failure: {str(e)}")
    
    async def run_task(self, task_id: int, task_type: str, input_data: Dict[str, Any]) -> bool:
        """Main task execution wrapper with logging and error handling"""
        start_time = time.time()
        
        try:
            # Validate task type
            if task_type not in self.get_supported_tasks():
                raise ValueError(f"Unsupported task type: {task_type}")
            
            # Update agent status and log task start
            await self.update_agent_status(AgentStatus.RUNNING)
            await self.log_task_start(task_id, task_type, input_data)
            
            # Execute the task
            self.logger.info(f"Executing task {task_id}: {task_type}")
            output_data = await self.execute_task(task_type, input_data)
            
            # Calculate execution time
            execution_time_ms = int((time.time() - start_time) * 1000)
            
            # Log completion
            await self.log_task_completion(task_id, output_data, execution_time_ms)
            await self.update_agent_status(AgentStatus.IDLE)
            
            return True
            
        except Exception as e:
            # Calculate execution time
            execution_time_ms = int((time.time() - start_time) * 1000)
            
            # Log failure
            error_message = str(e)
            await self.log_task_failure(task_id, error_message, execution_time_ms)
            await self.update_agent_status(AgentStatus.ERROR)
            
            self.logger.error(f"Task {task_id} failed: {error_message}")
            return False
    
    async def get_pending_tasks(self) -> List[Dict[str, Any]]:
        """Get pending tasks for this agent"""
        try:
            result = self.supabase.table("agent_logs")\
                .select("*")\
                .eq("agent_id", self.agent_id)\
                .eq("status", TaskStatus.PENDING.value)\
                .order("started_at")\
                .execute()
            
            return result.data
            
        except Exception as e:
            self.logger.error(f"Failed to get pending tasks: {str(e)}")
            return []
    
    async def process_pending_tasks(self, max_tasks: int = 1):
        """Process pending tasks for this agent"""
        try:
            pending_tasks = await self.get_pending_tasks()
            
            if not pending_tasks:
                self.logger.debug("No pending tasks found")
                return
            
            # Process tasks up to max_tasks limit
            tasks_to_process = pending_tasks[:max_tasks]
            
            for task in tasks_to_process:
                task_id = task["id"]
                task_type = task["task_type"]
                input_data = task.get("input_data", {})
                
                self.logger.info(f"Processing task {task_id}: {task_type}")
                success = await self.run_task(task_id, task_type, input_data)
                
                if not success:
                    self.logger.error(f"Task {task_id} failed, stopping task processing")
                    break
                    
        except Exception as e:
            self.logger.error(f"Error processing pending tasks: {str(e)}")
            await self.update_agent_status(AgentStatus.ERROR)
    
    def validate_input_data(self, required_fields: List[str], input_data: Dict[str, Any]) -> bool:
        """Validate that required fields are present in input data"""
        missing_fields = [field for field in required_fields if field not in input_data]
        
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        
        return True
    
    async def save_result_to_database(self, table_name: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save result data to specified table"""
        try:
            result = self.supabase.table(table_name).insert(data).execute()
            if result.data:
                self.logger.info(f"Saved data to {table_name}: {result.data[0]['id']}")
                return result.data[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to save to {table_name}: {str(e)}")
            return None
    
    async def get_campaign_data(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        """Get campaign data by ID"""
        try:
            result = self.supabase.table("campaigns")\
                .select("*")\
                .eq("id", campaign_id)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to get campaign {campaign_id}: {str(e)}")
            return None
    
    async def get_lead_data(self, lead_id: str = None, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get lead data with optional filters"""
        try:
            query = self.supabase.table("leads").select("*")
            
            if lead_id:
                query = query.eq("id", lead_id)
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            self.logger.error(f"Failed to get lead data: {str(e)}")
            return []
    
    async def update_campaign_metrics(self, campaign_id: str, metrics: Dict[str, Any]):
        """Update campaign metrics"""
        try:
            # Save to campaign_metrics table
            metric_data = {
                "campaign_id": campaign_id,
                "metric_type": "automated_update",
                "metric_value": 0,  # You can calculate aggregate value
                "metric_date": datetime.utcnow().date().isoformat(),
                "additional_data": metrics
            }
            
            await self.save_result_to_database("campaign_metrics", metric_data)
            
            # Update campaigns table metrics field
            self.supabase.table("campaigns")\
                .update({"metrics": metrics})\
                .eq("id", campaign_id)\
                .execute()
            
            self.logger.info(f"Updated metrics for campaign {campaign_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to update campaign metrics: {str(e)}")

class AgentRegistry:
    """Registry to manage different agent types"""
    
    def __init__(self):
        self.agents = {}
    
    def register_agent(self, agent_type: str, agent_class):
        """Register an agent class"""
        self.agents[agent_type] = agent_class
    
    def create_agent(self, agent_type: str, agent_id: int, supabase_client: Client, 
                    config: Dict[str, Any] = None) -> BaseAgent:
        """Create an agent instance"""
        if agent_type not in self.agents:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        return self.agents[agent_type](agent_id, supabase_client, config)
    
    def get_supported_types(self) -> List[str]:
        """Get list of supported agent types"""
        return list(self.agents.keys())

# Global agent registry
agent_registry = AgentRegistry()
