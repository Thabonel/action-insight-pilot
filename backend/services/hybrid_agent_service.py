"""
Hybrid Agent Service

This service provides a transition layer between legacy agents and OpenClaw skills.
It enables A/B testing and gradual rollout of OpenClaw integration while maintaining
backward compatibility with existing agent systems.
"""

import asyncio
import logging
import random
from typing import Dict, Any, Optional
from datetime import datetime
from .openclaw_service import get_openclaw_service, OpenClawService

logger = logging.getLogger(__name__)


class HybridAgentService:
    """
    Service that can route tasks to either legacy agents or OpenClaw skills

    Features:
    - A/B testing between legacy and OpenClaw implementations
    - Gradual rollout with percentage-based routing
    - Quality comparison and monitoring
    - Fallback to legacy agents on OpenClaw failures
    """

    def __init__(self):
        self.openclaw_service = get_openclaw_service()
        self.openclaw_percentage = 10  # Start with 10% OpenClaw traffic for testing
        self.enable_fallback = True
        self.legacy_agent_manager = None  # Will be set during initialization

    def set_openclaw_percentage(self, percentage: int):
        """Set the percentage of traffic to route to OpenClaw (0-100)"""
        self.openclaw_percentage = max(0, min(100, percentage))
        logger.info(f"OpenClaw traffic percentage set to {self.openclaw_percentage}%")

    def set_legacy_agent_manager(self, agent_manager):
        """Set the legacy agent manager for fallback operations"""
        self.legacy_agent_manager = agent_manager
        logger.info("Legacy agent manager configured for hybrid operation")

    def should_use_openclaw(self, user_id: str = None) -> bool:
        """Determine whether to use OpenClaw for this request"""
        if self.openclaw_percentage == 0:
            return False
        if self.openclaw_percentage == 100:
            return True

        # Use user ID for consistent routing (same user always gets same experience)
        if user_id:
            # Simple hash-based routing for consistency
            hash_value = hash(user_id) % 100
            return hash_value < self.openclaw_percentage
        else:
            # Random routing for anonymous users
            return random.randint(1, 100) <= self.openclaw_percentage

    async def execute_task(self, task_type: str, input_data: Dict[str, Any],
                          user_id: str = None, force_openclaw: bool = False) -> Dict[str, Any]:
        """
        Execute a task using either OpenClaw or legacy agents

        Args:
            task_type: The type of task to execute
            input_data: Task input parameters
            user_id: User ID for routing decisions and context
            force_openclaw: Force use of OpenClaw (for testing)

        Returns:
            Task execution result with metadata about which system was used
        """
        use_openclaw = force_openclaw or self.should_use_openclaw(user_id)

        start_time = datetime.now()

        try:
            if use_openclaw:
                logger.info(f"Routing {task_type} to OpenClaw for user {user_id}")
                result = await self._execute_openclaw_task(task_type, input_data, user_id)

                # If OpenClaw fails and fallback is enabled, try legacy agent
                if not result.get("success") and self.enable_fallback:
                    logger.warning(f"OpenClaw failed for {task_type}, falling back to legacy agent")
                    result = await self._execute_legacy_task(task_type, input_data, user_id)
                    result["execution_path"] = "openclaw_failed_fallback_legacy"
                else:
                    result["execution_path"] = "openclaw"

            else:
                logger.info(f"Routing {task_type} to legacy agent for user {user_id}")
                result = await self._execute_legacy_task(task_type, input_data, user_id)
                result["execution_path"] = "legacy"

            # Add execution metadata
            execution_time = (datetime.now() - start_time).total_seconds()
            result["execution_metadata"] = {
                "execution_time_seconds": execution_time,
                "openclaw_percentage": self.openclaw_percentage,
                "user_id": user_id,
                "task_type": task_type,
                "timestamp": datetime.now().isoformat(),
                "hybrid_service_version": "1.0.0"
            }

            return result

        except Exception as e:
            logger.error(f"Hybrid agent service error for {task_type}: {str(e)}")
            return {
                "success": False,
                "error": f"Hybrid service error: {str(e)}",
                "execution_path": "error",
                "task_type": task_type,
                "execution_metadata": {
                    "execution_time_seconds": (datetime.now() - start_time).total_seconds(),
                    "error_occurred": True
                }
            }

    async def _execute_openclaw_task(self, task_type: str, input_data: Dict[str, Any],
                                   user_id: str) -> Dict[str, Any]:
        """Execute task using OpenClaw"""
        try:
            return await self.openclaw_service.execute_marketing_task(task_type, input_data, user_id)
        except Exception as e:
            logger.error(f"OpenClaw task execution failed: {str(e)}")
            return {
                "success": False,
                "error": f"OpenClaw execution error: {str(e)}",
                "task_type": task_type
            }

    async def _execute_legacy_task(self, task_type: str, input_data: Dict[str, Any],
                                 user_id: str) -> Dict[str, Any]:
        """Execute task using legacy agents"""
        try:
            if not self.legacy_agent_manager:
                return {
                    "success": False,
                    "error": "Legacy agent manager not configured",
                    "task_type": task_type
                }

            # Call the legacy agent system
            # This is a placeholder - actual implementation depends on existing agent manager
            if hasattr(self.legacy_agent_manager, 'run_agent'):
                result = await self.legacy_agent_manager.run_agent(task_type, input_data)
                return {
                    "success": True,
                    "data": result,
                    "task_type": task_type,
                    "agent_system": "legacy"
                }
            else:
                # Fallback mock response for testing
                return {
                    "success": True,
                    "data": {
                        "result": f"Legacy agent {task_type} executed",
                        "input": input_data,
                        "mock": True
                    },
                    "task_type": task_type,
                    "agent_system": "legacy_mock"
                }

        except Exception as e:
            logger.error(f"Legacy agent execution failed: {str(e)}")
            return {
                "success": False,
                "error": f"Legacy agent error: {str(e)}",
                "task_type": task_type
            }

    async def get_system_status(self) -> Dict[str, Any]:
        """Get status of both OpenClaw and legacy agent systems"""
        openclaw_status = await self.openclaw_service.get_system_status()

        legacy_status = {"available": self.legacy_agent_manager is not None}
        if self.legacy_agent_manager and hasattr(self.legacy_agent_manager, 'get_system_status'):
            try:
                legacy_status = await self.legacy_agent_manager.get_system_status()
            except:
                pass

        return {
            "hybrid_service": {
                "openclaw_percentage": self.openclaw_percentage,
                "fallback_enabled": self.enable_fallback,
                "status": "active"
            },
            "openclaw": openclaw_status,
            "legacy": legacy_status,
            "timestamp": datetime.now().isoformat()
        }

    async def compare_implementations(self, task_type: str, input_data: Dict[str, Any],
                                    user_id: str = None) -> Dict[str, Any]:
        """
        Execute the same task with both OpenClaw and legacy agents for comparison

        This is useful for quality assessment and debugging during the migration
        """
        start_time = datetime.now()

        try:
            # Execute with both systems in parallel
            openclaw_task = asyncio.create_task(
                self._execute_openclaw_task(task_type, input_data, user_id)
            )
            legacy_task = asyncio.create_task(
                self._execute_legacy_task(task_type, input_data, user_id)
            )

            # Wait for both with timeout
            openclaw_result, legacy_result = await asyncio.gather(
                openclaw_task, legacy_task, return_exceptions=True
            )

            # Handle exceptions
            if isinstance(openclaw_result, Exception):
                openclaw_result = {
                    "success": False,
                    "error": f"Exception: {str(openclaw_result)}"
                }

            if isinstance(legacy_result, Exception):
                legacy_result = {
                    "success": False,
                    "error": f"Exception: {str(legacy_result)}"
                }

            execution_time = (datetime.now() - start_time).total_seconds()

            return {
                "comparison": {
                    "openclaw": openclaw_result,
                    "legacy": legacy_result,
                    "both_successful": (
                        openclaw_result.get("success") and legacy_result.get("success")
                    ),
                    "execution_time_seconds": execution_time,
                    "task_type": task_type,
                    "timestamp": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Comparison execution failed: {str(e)}")
            return {
                "comparison": {
                    "error": str(e),
                    "execution_time_seconds": (datetime.now() - start_time).total_seconds()
                }
            }

    def enable_ab_testing(self, percentage: int):
        """Enable A/B testing with specified OpenClaw percentage"""
        self.set_openclaw_percentage(percentage)
        logger.info(f"A/B testing enabled: {percentage}% OpenClaw, {100-percentage}% Legacy")

    def disable_ab_testing(self, use_openclaw_only: bool = False):
        """Disable A/B testing and route all traffic to one system"""
        if use_openclaw_only:
            self.set_openclaw_percentage(100)
            logger.info("A/B testing disabled: OpenClaw only")
        else:
            self.set_openclaw_percentage(0)
            logger.info("A/B testing disabled: Legacy agents only")


# Global hybrid service instance
_hybrid_service = None

def get_hybrid_agent_service() -> HybridAgentService:
    """Get the global hybrid agent service instance"""
    global _hybrid_service
    if _hybrid_service is None:
        _hybrid_service = HybridAgentService()
    return _hybrid_service