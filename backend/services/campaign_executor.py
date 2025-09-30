"""
Campaign Execution Service

This service coordinates the execution of marketing campaigns by:
1. Orchestrating multiple AI agents (email, social, content)
2. Scheduling campaign activities
3. Managing campaign lifecycle
4. Tracking execution status
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class CampaignStatus(str, Enum):
    """Campaign execution status"""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class ExecutionResult:
    """Result of campaign execution"""
    def __init__(self, success: bool, campaign_id: str, message: str, data: Dict[str, Any] = None):
        self.success = success
        self.campaign_id = campaign_id
        self.message = message
        self.data = data or {}
        self.timestamp = datetime.now().isoformat()

class CampaignExecutor:
    """
    Orchestrates campaign execution across multiple channels and agents
    """

    def __init__(self, supabase_client, email_agent=None, social_agent=None, content_agent=None, task_scheduler=None):
        self.supabase = supabase_client
        self.email_agent = email_agent
        self.social_agent = social_agent
        self.content_agent = content_agent
        self.task_scheduler = task_scheduler
        self.logger = logging.getLogger(f"{__class__.__name__}")

    async def launch_campaign(self, campaign_id: str, user_id: str) -> ExecutionResult:
        """
        Launch a campaign - orchestrates all execution steps

        Args:
            campaign_id: Campaign to launch
            user_id: User who owns the campaign

        Returns:
            ExecutionResult with success status and details
        """
        try:
            self.logger.info(f"🚀 Launching campaign {campaign_id} for user {user_id}")

            # 1. Fetch campaign from database
            campaign = await self._get_campaign(campaign_id, user_id)
            if not campaign:
                return ExecutionResult(
                    success=False,
                    campaign_id=campaign_id,
                    message=f"Campaign {campaign_id} not found or access denied"
                )

            # 2. Validate campaign is ready to launch
            validation = self._validate_campaign(campaign)
            if not validation["valid"]:
                return ExecutionResult(
                    success=False,
                    campaign_id=campaign_id,
                    message=f"Campaign validation failed: {validation['errors']}"
                )

            # 3. Update status to ACTIVE
            await self._update_campaign_status(campaign_id, CampaignStatus.ACTIVE)

            # 4. Execute based on campaign channels
            execution_results = {
                "email": None,
                "social": None,
                "content": None
            }

            channels = campaign.get("channels", [])

            # Execute email campaigns
            if "email" in channels and self.email_agent:
                self.logger.info(f"📧 Executing email campaign for {campaign_id}")
                execution_results["email"] = await self._execute_email_campaign(campaign, user_id)

            # Execute social media campaigns
            if any(ch in channels for ch in ["social", "facebook", "twitter", "linkedin", "instagram"]) and self.social_agent:
                self.logger.info(f"📱 Executing social media campaign for {campaign_id}")
                execution_results["social"] = await self._execute_social_campaign(campaign, user_id)

            # Execute content publishing
            if "content" in channels or "blog" in channels:
                self.logger.info(f"📝 Executing content campaign for {campaign_id}")
                execution_results["content"] = await self._execute_content_campaign(campaign, user_id)

            # 5. Log execution summary
            summary = self._generate_execution_summary(execution_results)
            await self._log_campaign_execution(campaign_id, user_id, execution_results, summary)

            return ExecutionResult(
                success=True,
                campaign_id=campaign_id,
                message=f"Campaign launched successfully. {summary}",
                data={
                    "execution_results": execution_results,
                    "summary": summary,
                    "campaign_status": CampaignStatus.ACTIVE
                }
            )

        except Exception as e:
            self.logger.error(f"❌ Campaign launch failed: {str(e)}")
            await self._update_campaign_status(campaign_id, CampaignStatus.FAILED)
            return ExecutionResult(
                success=False,
                campaign_id=campaign_id,
                message=f"Campaign launch failed: {str(e)}"
            )

    async def _get_campaign(self, campaign_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch campaign from database"""
        try:
            result = self.supabase.table('campaigns') \
                .select('*') \
                .eq('id', campaign_id) \
                .eq('created_by', user_id) \
                .single() \
                .execute()

            return result.data if result.data else None
        except Exception as e:
            self.logger.error(f"Error fetching campaign: {e}")
            return None

    def _validate_campaign(self, campaign: Dict[str, Any]) -> Dict[str, Any]:
        """Validate campaign is ready for launch"""
        errors = []

        # Check required fields
        if not campaign.get("name"):
            errors.append("Campaign name is required")

        if not campaign.get("channels"):
            errors.append("At least one channel must be selected")

        # Check dates
        start_date = campaign.get("start_date")
        end_date = campaign.get("end_date")

        if start_date and end_date:
            if datetime.fromisoformat(end_date.replace('Z', '+00:00')) < datetime.now():
                errors.append("Campaign end date is in the past")

        # Check budget if specified
        budget = campaign.get("budget_allocated", 0)
        if budget <= 0:
            errors.append("Campaign budget must be greater than 0")

        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

    async def _execute_email_campaign(self, campaign: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute email component of campaign"""
        try:
            if not self.email_agent:
                return {"success": False, "message": "Email agent not available"}

            # Extract email-specific data from campaign
            email_content = campaign.get("content", {}).get("email", {})
            target_audience = campaign.get("target_audience", {})

            # Create email campaign
            email_campaign_data = {
                "name": f"{campaign['name']} - Email",
                "subject": email_content.get("subject_line", campaign.get("name")),
                "audience": target_audience,
                "content": email_content.get("body", ""),
                "campaign_type": "promotional"
            }

            # Use email agent to create and schedule campaign
            result = await self.email_agent.create_campaign(**email_campaign_data)

            # Schedule send if specified
            send_time = campaign.get("settings", {}).get("email_send_time")
            if send_time and result.get("success"):
                campaign_id = result.get("campaign_id")
                await self.email_agent.schedule_campaign(campaign_id, send_time)

            return {
                "success": result.get("success", False),
                "message": "Email campaign created and scheduled",
                "email_campaign_id": result.get("campaign_id"),
                "scheduled_time": send_time
            }

        except Exception as e:
            self.logger.error(f"Email execution failed: {e}")
            return {"success": False, "message": str(e)}

    async def _execute_social_campaign(self, campaign: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute social media component of campaign"""
        try:
            if not self.social_agent and not self.task_scheduler:
                return {"success": False, "message": "Social agent or task scheduler not available"}

            # Extract content calendar or social posts
            content_calendar = campaign.get("content_calendar", [])
            social_posts = []
            scheduled_count = 0

            for content_item in content_calendar:
                if content_item.get("channel") in ["social", "facebook", "twitter", "linkedin", "instagram"]:
                    platforms = [content_item.get("platform", "facebook")]
                    scheduled_time = content_item.get("publish_date")

                    # If task scheduler is available and scheduled time is in the future, use it
                    if self.task_scheduler and scheduled_time:
                        try:
                            from datetime import datetime
                            schedule_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))

                            # Only schedule if in the future
                            if schedule_dt > datetime.now(schedule_dt.tzinfo):
                                post_id = f"{campaign['id']}_post_{len(social_posts)}"

                                job_id = self.task_scheduler.schedule_social_post(
                                    post_id=post_id,
                                    campaign_id=campaign["id"],
                                    user_id=user_id,
                                    content=content_item.get("content", ""),
                                    platforms=platforms,
                                    scheduled_time=schedule_dt,
                                    media_urls=content_item.get("media_urls", [])
                                )

                                if job_id:
                                    scheduled_count += 1
                                    social_posts.append({
                                        "post_id": post_id,
                                        "job_id": job_id,
                                        "platform": platforms[0],
                                        "scheduled_time": scheduled_time,
                                        "success": True,
                                        "method": "scheduler"
                                    })
                                    continue
                        except Exception as scheduler_error:
                            self.logger.warning(f"Failed to schedule with task scheduler: {scheduler_error}")

                    # Fallback to social agent immediate posting
                    if self.social_agent:
                        post_data = {
                            "content": content_item.get("content", ""),
                            "platforms": platforms,
                            "scheduled_time": scheduled_time,
                            "campaign_id": campaign["id"]
                        }

                        result = await self.social_agent.schedule_post(**post_data)
                        social_posts.append({
                            "post_id": result.get("post_id"),
                            "platform": platforms[0],
                            "scheduled_time": scheduled_time,
                            "success": result.get("success", False),
                            "method": "agent"
                        })

            return {
                "success": True,
                "message": f"Scheduled {scheduled_count} posts via scheduler, {len(social_posts) - scheduled_count} via agent",
                "posts": social_posts,
                "scheduled_count": scheduled_count
            }

        except Exception as e:
            self.logger.error(f"Social execution failed: {e}")
            return {"success": False, "message": str(e)}

    async def _execute_content_campaign(self, campaign: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute content publishing component"""
        try:
            # Extract blog/content items from campaign
            content_items = campaign.get("content_calendar", [])
            published_content = []
            scheduled_count = 0

            for item in content_items:
                if item.get("type") in ["blog", "article", "content"]:
                    # Create content entry in database
                    content_data = {
                        "title": item.get("title"),
                        "content": item.get("content"),
                        "status": "scheduled",
                        "publish_date": item.get("publish_date"),
                        "campaign_id": campaign["id"],
                        "created_by": user_id
                    }

                    result = self.supabase.table('generated_content_pieces').insert(content_data).execute()

                    if result.data:
                        content_id = result.data[0]["id"]
                        publish_date = item.get("publish_date")

                        # Schedule publishing if task scheduler is available and publish date is in future
                        if self.task_scheduler and publish_date:
                            try:
                                from datetime import datetime
                                publish_dt = datetime.fromisoformat(publish_date.replace('Z', '+00:00'))

                                if publish_dt > datetime.now(publish_dt.tzinfo):
                                    job_id = self.task_scheduler.schedule_content_publish(
                                        content_id=content_id,
                                        campaign_id=campaign["id"],
                                        user_id=user_id,
                                        title=item.get("title", ""),
                                        content=item.get("content", ""),
                                        publish_time=publish_dt,
                                        content_type=item.get("type", "blog")
                                    )

                                    if job_id:
                                        scheduled_count += 1

                            except Exception as scheduler_error:
                                self.logger.warning(f"Failed to schedule content publish: {scheduler_error}")

                        published_content.append({
                            "content_id": content_id,
                            "title": item.get("title"),
                            "scheduled_date": publish_date,
                            "method": "scheduler" if scheduled_count else "database"
                        })

            return {
                "success": True,
                "message": f"Scheduled {scheduled_count} content pieces via scheduler, {len(published_content) - scheduled_count} in database",
                "content": published_content,
                "scheduled_count": scheduled_count
            }

        except Exception as e:
            self.logger.error(f"Content execution failed: {e}")
            return {"success": False, "message": str(e)}

    async def _update_campaign_status(self, campaign_id: str, status: CampaignStatus):
        """Update campaign status in database"""
        try:
            self.supabase.table('campaigns').update({
                "status": status.value,
                "updated_at": datetime.now().isoformat()
            }).eq('id', campaign_id).execute()

            self.logger.info(f"✅ Campaign {campaign_id} status updated to {status.value}")
        except Exception as e:
            self.logger.error(f"Failed to update campaign status: {e}")

    def _generate_execution_summary(self, results: Dict[str, Any]) -> str:
        """Generate human-readable execution summary"""
        summary_parts = []

        if results.get("email"):
            if results["email"].get("success"):
                summary_parts.append("Email campaign scheduled")
            else:
                summary_parts.append("Email campaign failed")

        if results.get("social"):
            if results["social"].get("success"):
                posts_count = len(results["social"].get("posts", []))
                summary_parts.append(f"{posts_count} social posts scheduled")
            else:
                summary_parts.append("Social campaign failed")

        if results.get("content"):
            if results["content"].get("success"):
                content_count = len(results["content"].get("content", []))
                summary_parts.append(f"{content_count} content pieces scheduled")
            else:
                summary_parts.append("Content campaign failed")

        return ". ".join(summary_parts) if summary_parts else "No actions executed"

    async def _log_campaign_execution(self, campaign_id: str, user_id: str, results: Dict[str, Any], summary: str):
        """Log execution details to database"""
        try:
            log_entry = {
                "campaign_id": campaign_id,
                "user_id": user_id,
                "execution_timestamp": datetime.now().isoformat(),
                "results": results,
                "summary": summary,
                "status": "completed"
            }

            self.supabase.table('campaign_execution_logs').insert(log_entry).execute()
            self.logger.info(f"📝 Execution logged for campaign {campaign_id}")
        except Exception as e:
            self.logger.error(f"Failed to log execution: {e}")

    async def pause_campaign(self, campaign_id: str, user_id: str) -> ExecutionResult:
        """Pause an active campaign"""
        try:
            await self._update_campaign_status(campaign_id, CampaignStatus.PAUSED)

            # TODO: Pause scheduled emails and posts

            return ExecutionResult(
                success=True,
                campaign_id=campaign_id,
                message="Campaign paused successfully"
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                campaign_id=campaign_id,
                message=f"Failed to pause campaign: {str(e)}"
            )

    async def resume_campaign(self, campaign_id: str, user_id: str) -> ExecutionResult:
        """Resume a paused campaign"""
        try:
            await self._update_campaign_status(campaign_id, CampaignStatus.ACTIVE)

            # TODO: Resume scheduled emails and posts

            return ExecutionResult(
                success=True,
                campaign_id=campaign_id,
                message="Campaign resumed successfully"
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                campaign_id=campaign_id,
                message=f"Failed to resume campaign: {str(e)}"
            )

    async def stop_campaign(self, campaign_id: str, user_id: str) -> ExecutionResult:
        """Stop and complete a campaign"""
        try:
            await self._update_campaign_status(campaign_id, CampaignStatus.COMPLETED)

            # TODO: Cancel all pending scheduled items

            return ExecutionResult(
                success=True,
                campaign_id=campaign_id,
                message="Campaign stopped and marked as completed"
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                campaign_id=campaign_id,
                message=f"Failed to stop campaign: {str(e)}"
            )