
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
import time
from supabase import Client
from .enums import TaskStatus, AgentStatus
from .agent_logging import AgentLogger
from .agent_utils import AgentUtils

logger = logging.getLogger(__name__)

class BaseAgentCore(ABC):
    """Core base class for all AI marketing agents"""
    
    def __init__(self, agent_id: int, supabase_client: Client, config: Dict[str, Any] = None):
        self.agent_id = agent_id
        self.supabase = supabase_client
        self.config = config or {}
        self.logger = logging.getLogger(f"{self.__class__.__name__}_{agent_id}")
        self.status = AgentStatus.IDLE
        
        # Initialize helper components
        self.agent_logger = AgentLogger(supabase_client, agent_id)
        self.agent_utils = AgentUtils(supabase_client, agent_id)
        
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
        self.status = status
        await self.agent_logger.update_agent_status(status)
    
    async def run_task(self, task_id: int, task_type: str, input_data: Dict[str, Any]) -> bool:
        """Main task execution wrapper with logging and error handling"""
        start_time = time.time()
        
        try:
            # Validate task type
            if task_type not in self.get_supported_tasks():
                raise ValueError(f"Unsupported task type: {task_type}")
            
            # Update agent status and log task start
            await self.update_agent_status(AgentStatus.RUNNING)
            await self.agent_logger.log_task_start(task_id, task_type, input_data)
            
            # Execute the task
            self.logger.info(f"Executing task {task_id}: {task_type}")
            output_data = await self.execute_task(task_type, input_data)
            
            # Calculate execution time
            execution_time_ms = int((time.time() - start_time) * 1000)
            
            # Log completion
            await self.agent_logger.log_task_completion(task_id, output_data, execution_time_ms)
            await self.update_agent_status(AgentStatus.IDLE)
            
            return True
            
        except Exception as e:
            # Calculate execution time
            execution_time_ms = int((time.time() - start_time) * 1000)
            
            # Log failure
            error_message = str(e)
            await self.agent_logger.log_task_failure(task_id, error_message, execution_time_ms)
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
    
    # Delegate utility methods to agent_utils
    def validate_input_data(self, required_fields: List[str], input_data: Dict[str, Any]) -> bool:
        return self.agent_utils.validate_input_data(required_fields, input_data)
    
    async def save_result_to_database(self, table_name: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return await self.agent_utils.save_result_to_database(table_name, data)
    
    async def get_campaign_data(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        return await self.agent_utils.get_campaign_data(campaign_id)
    
    async def get_lead_data(self, lead_id: str = None, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        return await self.agent_utils.get_lead_data(lead_id, filters)
    
    async def update_campaign_metrics(self, campaign_id: str, metrics: Dict[str, Any]):
        return await self.agent_utils.update_campaign_metrics(campaign_id, metrics)
