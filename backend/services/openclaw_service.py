"""
OpenClaw Integration Service

This service bridges the AIBoostCampaign platform with OpenClaw's autonomous AI assistant.
It replaces the existing 50+ specialized Python agents with OpenClaw's skill-based system.
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import subprocess
import os
from pathlib import Path

logger = logging.getLogger(__name__)


class OpenClawError(Exception):
    """Base exception for OpenClaw integration errors"""
    pass


class OpenClawService:
    """
    Main service class for OpenClaw integration

    This service replaces the existing AgentManager and provides a unified interface
    for executing marketing tasks through OpenClaw skills.
    """

    def __init__(self):
        self.openclaw_cli_path = self._find_openclaw_cli()
        self.skill_mapping = self._initialize_skill_mapping()
        self.fallback_enabled = True

    def _find_openclaw_cli(self) -> str:
        """Find OpenClaw CLI executable path"""
        # Check if we have the local openclaw-core installation
        local_cli = Path(__file__).parent.parent.parent / "openclaw-core" / "openclaw.mjs"
        if local_cli.exists():
            return str(local_cli)
        return "openclaw"

    def _initialize_skill_mapping(self) -> Dict[str, str]:
        """Map legacy agent types to OpenClaw marketing skills"""
        return {
            "campaign_agent": "marketing-campaign-optimizer",
            "content_agent": "marketing-content-generator",
            "lead_generation_agent": "marketing-lead-scorer",
            "social_media_agent": "marketing-social-scheduler",
            "keyword_research_agent": "marketing-seo-analyzer",
            "email_automation_agent": "marketing-email-automator",
            "analytics_agent": "marketing-analytics-reporter"
        }

    async def execute_marketing_task(self, task_type: str, input_data: Dict[str, Any],
                                   user_id: str = None) -> Dict[str, Any]:
        """Execute a marketing task using OpenClaw skills"""
        try:
            skill_name = self.skill_mapping.get(task_type, "marketing-campaign-optimizer")

            # Add context to input data
            enhanced_input = {
                **input_data,
                "user_id": user_id,
                "task_type": task_type,
                "platform": "aiboostcampaign"
            }

            session_id = f"aiboost-{user_id or 'anon'}-{task_type}"
            message = f"Execute {skill_name} skill: {json.dumps(enhanced_input, indent=2)}"

            # Use subprocess safely with fixed arguments
            cmd = [
                self.openclaw_cli_path,
                "agent",
                "--local",
                "--session-id", session_id,
                "--message", message,
                "--json"
            ]

            logger.info(f"Executing OpenClaw skill: {skill_name}")

            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(Path(self.openclaw_cli_path).parent)
            )

            stdout, stderr = await result.communicate()

            if result.returncode != 0:
                logger.error(f"OpenClaw execution failed: {stderr.decode()}")
                return {
                    "success": False,
                    "error": f"Skill execution failed: {stderr.decode()}",
                    "task_type": task_type
                }

            try:
                response = json.loads(stdout.decode())
                return {
                    "success": True,
                    "data": response,
                    "skill_name": skill_name,
                    "task_type": task_type
                }
            except json.JSONDecodeError:
                return {
                    "success": True,
                    "data": {"response": stdout.decode()},
                    "skill_name": skill_name,
                    "task_type": task_type
                }

        except Exception as e:
            logger.error(f"OpenClaw error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "task_type": task_type,
                "fallback_available": self.fallback_enabled
            }

    async def get_system_status(self) -> Dict[str, Any]:
        """Get OpenClaw system status"""
        try:
            # Simple status check using subprocess safely
            result = await asyncio.create_subprocess_exec(
                self.openclaw_cli_path, "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await result.communicate()

            return {
                "openclaw_available": result.returncode == 0,
                "version": stdout.decode().strip() if result.returncode == 0 else "unknown",
                "skill_mappings": len(self.skill_mapping),
                "fallback_enabled": self.fallback_enabled,
                "last_check": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "openclaw_available": False,
                "error": str(e),
                "last_check": datetime.now().isoformat()
            }


# Global service instance
_openclaw_service = None

def get_openclaw_service() -> OpenClawService:
    """Get the global OpenClaw service instance"""
    global _openclaw_service
    if _openclaw_service is None:
        _openclaw_service = OpenClawService()
    return _openclaw_service