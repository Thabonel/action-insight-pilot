
from datetime import datetime
from typing import Dict, Any
import logging
import time
from supabase import Client
from .enums import TaskStatus, AgentStatus

logger = logging.getLogger(__name__)

class AgentLogger:
    """Handles agent logging operations"""
    
    def __init__(self, supabase_client: Client, agent_id: int):
        self.supabase = supabase_client
        self.agent_id = agent_id
        self.logger = logging.getLogger(f"AgentLogger_{agent_id}")
    
    async def update_agent_status(self, status: AgentStatus):
        """Update agent status in database"""
        try:
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
