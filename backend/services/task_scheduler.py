"""
Background Task Scheduler Service

This service manages scheduled tasks for campaign automation:
1. Scheduled social media posts
2. Email sequence automation
3. Content publishing
4. Campaign performance checks
5. Lead nurturing workflows
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.job import Job
import pytz

logger = logging.getLogger(__name__)

class TaskScheduler:
    """
    Background task scheduler for marketing automation
    Uses APScheduler for reliable job execution
    """

    def __init__(self, supabase_client, email_agent=None, social_agent=None, content_agent=None):
        self.supabase = supabase_client
        self.email_agent = email_agent
        self.social_agent = social_agent
        self.content_agent = content_agent

        # Initialize APScheduler with background execution
        self.scheduler = BackgroundScheduler(
            timezone=pytz.UTC,
            job_defaults={
                'coalesce': False,  # Run each missed job individually
                'max_instances': 3,  # Allow up to 3 concurrent instances per job
                'misfire_grace_time': 300  # 5 minutes grace period for missed jobs
            }
        )

        self.scheduler.start()
        logger.info("✅ Task Scheduler initialized and started")

    def shutdown(self):
        """Gracefully shutdown the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=True)
            logger.info("🛑 Task Scheduler shut down")

    # ==================== Social Media Scheduling ====================

    def schedule_social_post(
        self,
        post_id: str,
        campaign_id: str,
        user_id: str,
        content: str,
        platforms: List[str],
        scheduled_time: datetime,
        media_urls: List[str] = None
    ) -> Optional[str]:
        """
        Schedule a social media post for future publishing

        Args:
            post_id: Unique post identifier
            campaign_id: Associated campaign ID
            user_id: User who owns the post
            content: Post content/caption
            platforms: List of platforms to post to (facebook, twitter, linkedin, instagram)
            scheduled_time: When to publish the post
            media_urls: Optional list of image/video URLs

        Returns:
            Job ID if scheduled successfully, None otherwise
        """
        try:
            job = self.scheduler.add_job(
                func=self._execute_social_post,
                trigger=DateTrigger(run_date=scheduled_time),
                args=[post_id, campaign_id, user_id, content, platforms, media_urls],
                id=f"social_post_{post_id}",
                name=f"Social Post: {content[:50]}...",
                replace_existing=True
            )

            logger.info(f"📅 Scheduled social post {post_id} for {scheduled_time}")

            # Store job metadata in database
            self._save_scheduled_job(
                job_id=job.id,
                job_type='social_post',
                campaign_id=campaign_id,
                user_id=user_id,
                scheduled_time=scheduled_time,
                metadata={
                    'post_id': post_id,
                    'platforms': platforms,
                    'content_preview': content[:100]
                }
            )

            return job.id

        except Exception as e:
            logger.error(f"❌ Failed to schedule social post {post_id}: {e}")
            return None

    async def _execute_social_post(
        self,
        post_id: str,
        campaign_id: str,
        user_id: str,
        content: str,
        platforms: List[str],
        media_urls: List[str] = None
    ):
        """Execute scheduled social post"""
        try:
            logger.info(f"🚀 Publishing social post {post_id} to {platforms}")

            if not self.social_agent:
                logger.error("❌ Social agent not available")
                self._mark_job_failed(post_id, "Social agent not configured")
                return

            # Publish to each platform
            results = {}
            for platform in platforms:
                try:
                    result = await self.social_agent.publish_post(
                        content=content,
                        platform=platform,
                        media_urls=media_urls
                    )
                    results[platform] = result
                    logger.info(f"✅ Published to {platform}: {result.get('post_id')}")
                except Exception as platform_error:
                    logger.error(f"❌ Failed to publish to {platform}: {platform_error}")
                    results[platform] = {'success': False, 'error': str(platform_error)}

            # Update post status in database
            self._update_post_status(post_id, 'published', results)

            # Log execution
            self._log_job_execution(
                job_id=f"social_post_{post_id}",
                job_type='social_post',
                campaign_id=campaign_id,
                user_id=user_id,
                status='completed',
                results=results
            )

        except Exception as e:
            logger.error(f"❌ Failed to execute social post {post_id}: {e}")
            self._mark_job_failed(post_id, str(e))

    # ==================== Email Sequence Scheduling ====================

    def schedule_email_sequence(
        self,
        sequence_id: str,
        campaign_id: str,
        user_id: str,
        emails: List[Dict[str, Any]],
        start_time: datetime
    ) -> List[str]:
        """
        Schedule an entire email sequence

        Args:
            sequence_id: Unique sequence identifier
            campaign_id: Associated campaign ID
            user_id: User who owns the sequence
            emails: List of email configurations with delay_days
            start_time: When to start the sequence

        Returns:
            List of scheduled job IDs
        """
        job_ids = []

        try:
            current_time = start_time

            for idx, email_config in enumerate(emails):
                # Calculate send time based on delay
                delay_days = email_config.get('delay_days', 0)
                send_time = current_time + timedelta(days=delay_days)

                # Schedule individual email
                job = self.scheduler.add_job(
                    func=self._execute_email_send,
                    trigger=DateTrigger(run_date=send_time),
                    args=[
                        f"{sequence_id}_email_{idx}",
                        campaign_id,
                        user_id,
                        email_config
                    ],
                    id=f"email_sequence_{sequence_id}_{idx}",
                    name=f"Email: {email_config.get('subject', 'No subject')[:50]}",
                    replace_existing=True
                )

                job_ids.append(job.id)
                logger.info(f"📧 Scheduled email {idx + 1}/{len(emails)} for {send_time}")

                # Store job metadata
                self._save_scheduled_job(
                    job_id=job.id,
                    job_type='email_sequence',
                    campaign_id=campaign_id,
                    user_id=user_id,
                    scheduled_time=send_time,
                    metadata={
                        'sequence_id': sequence_id,
                        'email_index': idx,
                        'subject': email_config.get('subject', '')
                    }
                )

                # Update current_time for next email
                current_time = send_time

            logger.info(f"✅ Scheduled complete email sequence {sequence_id} with {len(emails)} emails")
            return job_ids

        except Exception as e:
            logger.error(f"❌ Failed to schedule email sequence {sequence_id}: {e}")
            return job_ids

    async def _execute_email_send(
        self,
        email_id: str,
        campaign_id: str,
        user_id: str,
        email_config: Dict[str, Any]
    ):
        """Execute scheduled email send"""
        try:
            logger.info(f"📤 Sending email {email_id}")

            if not self.email_agent:
                logger.error("❌ Email agent not available")
                self._mark_job_failed(email_id, "Email agent not configured")
                return

            # Send email using email agent
            result = await self.email_agent.send_email(
                subject=email_config.get('subject'),
                body=email_config.get('body'),
                recipients=email_config.get('recipients'),
                template_id=email_config.get('template_id')
            )

            if result.get('success'):
                logger.info(f"✅ Email {email_id} sent successfully")

                # Update email status in database
                self._update_email_status(email_id, 'sent', result)

                # Log execution
                self._log_job_execution(
                    job_id=email_id,
                    job_type='email_sequence',
                    campaign_id=campaign_id,
                    user_id=user_id,
                    status='completed',
                    results=result
                )
            else:
                raise Exception(result.get('error', 'Unknown error'))

        except Exception as e:
            logger.error(f"❌ Failed to send email {email_id}: {e}")
            self._mark_job_failed(email_id, str(e))

    # ==================== Content Publishing Scheduling ====================

    def schedule_content_publish(
        self,
        content_id: str,
        campaign_id: str,
        user_id: str,
        title: str,
        content: str,
        publish_time: datetime,
        content_type: str = 'blog'
    ) -> Optional[str]:
        """
        Schedule content for future publishing

        Args:
            content_id: Unique content identifier
            campaign_id: Associated campaign ID
            user_id: User who owns the content
            title: Content title
            content: Full content body
            publish_time: When to publish
            content_type: Type of content (blog, article, etc.)

        Returns:
            Job ID if scheduled successfully
        """
        try:
            job = self.scheduler.add_job(
                func=self._execute_content_publish,
                trigger=DateTrigger(run_date=publish_time),
                args=[content_id, campaign_id, user_id, title, content, content_type],
                id=f"content_publish_{content_id}",
                name=f"Publish: {title[:50]}...",
                replace_existing=True
            )

            logger.info(f"📝 Scheduled content publish {content_id} for {publish_time}")

            # Store job metadata
            self._save_scheduled_job(
                job_id=job.id,
                job_type='content_publish',
                campaign_id=campaign_id,
                user_id=user_id,
                scheduled_time=publish_time,
                metadata={
                    'content_id': content_id,
                    'title': title,
                    'content_type': content_type
                }
            )

            return job.id

        except Exception as e:
            logger.error(f"❌ Failed to schedule content publish {content_id}: {e}")
            return None

    async def _execute_content_publish(
        self,
        content_id: str,
        campaign_id: str,
        user_id: str,
        title: str,
        content: str,
        content_type: str
    ):
        """Execute scheduled content publishing"""
        try:
            logger.info(f"📰 Publishing content {content_id}")

            # Update content status to published in database
            result = self.supabase.table('generated_content_pieces').update({
                'status': 'published',
                'published_at': datetime.now().isoformat()
            }).eq('id', content_id).eq('created_by', user_id).execute()

            if result.data:
                logger.info(f"✅ Content {content_id} published successfully")

                # Log execution
                self._log_job_execution(
                    job_id=f"content_publish_{content_id}",
                    job_type='content_publish',
                    campaign_id=campaign_id,
                    user_id=user_id,
                    status='completed',
                    results={'published': True, 'content_id': content_id}
                )
            else:
                raise Exception("Failed to update content status")

        except Exception as e:
            logger.error(f"❌ Failed to publish content {content_id}: {e}")
            self._mark_job_failed(content_id, str(e))

    # ==================== Campaign Performance Monitoring ====================

    def schedule_campaign_monitoring(
        self,
        campaign_id: str,
        user_id: str,
        check_interval_hours: int = 24
    ) -> Optional[str]:
        """
        Schedule periodic campaign performance checks

        Args:
            campaign_id: Campaign to monitor
            user_id: User who owns the campaign
            check_interval_hours: How often to check performance (default: 24 hours)

        Returns:
            Job ID if scheduled successfully
        """
        try:
            job = self.scheduler.add_job(
                func=self._check_campaign_performance,
                trigger=IntervalTrigger(hours=check_interval_hours),
                args=[campaign_id, user_id],
                id=f"campaign_monitor_{campaign_id}",
                name=f"Monitor Campaign: {campaign_id}",
                replace_existing=True
            )

            logger.info(f"📊 Scheduled campaign monitoring for {campaign_id} every {check_interval_hours}h")
            return job.id

        except Exception as e:
            logger.error(f"❌ Failed to schedule campaign monitoring: {e}")
            return None

    async def _check_campaign_performance(self, campaign_id: str, user_id: str):
        """Check campaign performance and send alerts if needed"""
        try:
            logger.info(f"📊 Checking performance for campaign {campaign_id}")

            # Fetch current metrics from database
            result = self.supabase.table('campaigns').select('metrics, kpi_targets').eq('id', campaign_id).single().execute()

            if result.data:
                metrics = result.data.get('metrics', {})
                targets = result.data.get('kpi_targets', {})

                # Check if targets are being met
                alerts = []

                if targets.get('conversion') and metrics.get('conversion_rate', 0) < float(targets['conversion']) * 0.5:
                    alerts.append(f"Conversion rate ({metrics.get('conversion_rate', 0)}%) is below 50% of target")

                if targets.get('roi') and metrics.get('roi', 0) < float(targets['roi']) * 0.5:
                    alerts.append(f"ROI is below 50% of target")

                # Log performance check
                self._log_job_execution(
                    job_id=f"campaign_monitor_{campaign_id}",
                    job_type='campaign_monitoring',
                    campaign_id=campaign_id,
                    user_id=user_id,
                    status='completed',
                    results={
                        'metrics': metrics,
                        'alerts': alerts
                    }
                )

                # TODO: Send notifications if there are alerts
                if alerts:
                    logger.warning(f"⚠️ Campaign {campaign_id} has performance alerts: {alerts}")

        except Exception as e:
            logger.error(f"❌ Failed to check campaign performance: {e}")

    # ==================== Job Management ====================

    def cancel_job(self, job_id: str) -> bool:
        """Cancel a scheduled job"""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"🗑️ Cancelled job {job_id}")

            # Update database
            self._update_job_status(job_id, 'cancelled')
            return True

        except Exception as e:
            logger.error(f"❌ Failed to cancel job {job_id}: {e}")
            return False

    def pause_campaign_jobs(self, campaign_id: str) -> int:
        """Pause all jobs associated with a campaign"""
        try:
            jobs = self.scheduler.get_jobs()
            paused_count = 0

            for job in jobs:
                # Check if job belongs to this campaign
                if campaign_id in job.id:
                    job.pause()
                    paused_count += 1
                    logger.info(f"⏸️ Paused job {job.id}")

            logger.info(f"⏸️ Paused {paused_count} jobs for campaign {campaign_id}")
            return paused_count

        except Exception as e:
            logger.error(f"❌ Failed to pause campaign jobs: {e}")
            return 0

    def resume_campaign_jobs(self, campaign_id: str) -> int:
        """Resume all paused jobs associated with a campaign"""
        try:
            jobs = self.scheduler.get_jobs()
            resumed_count = 0

            for job in jobs:
                # Check if job belongs to this campaign
                if campaign_id in job.id:
                    job.resume()
                    resumed_count += 1
                    logger.info(f"▶️ Resumed job {job.id}")

            logger.info(f"▶️ Resumed {resumed_count} jobs for campaign {campaign_id}")
            return resumed_count

        except Exception as e:
            logger.error(f"❌ Failed to resume campaign jobs: {e}")
            return 0

    def get_scheduled_jobs(self, campaign_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get list of scheduled jobs, optionally filtered by campaign"""
        try:
            jobs = self.scheduler.get_jobs()

            job_list = []
            for job in jobs:
                # Filter by campaign if specified
                if campaign_id and campaign_id not in job.id:
                    continue

                job_list.append({
                    'id': job.id,
                    'name': job.name,
                    'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                    'trigger': str(job.trigger)
                })

            return job_list

        except Exception as e:
            logger.error(f"❌ Failed to get scheduled jobs: {e}")
            return []

    # ==================== Database Helpers ====================

    def _save_scheduled_job(
        self,
        job_id: str,
        job_type: str,
        campaign_id: str,
        user_id: str,
        scheduled_time: datetime,
        metadata: Dict[str, Any]
    ):
        """Save scheduled job to database for tracking"""
        try:
            self.supabase.table('scheduled_jobs').insert({
                'job_id': job_id,
                'job_type': job_type,
                'campaign_id': campaign_id,
                'user_id': user_id,
                'scheduled_time': scheduled_time.isoformat(),
                'status': 'scheduled',
                'metadata': metadata,
                'created_at': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Failed to save scheduled job to database: {e}")

    def _update_job_status(self, job_id: str, status: str):
        """Update job status in database"""
        try:
            self.supabase.table('scheduled_jobs').update({
                'status': status,
                'updated_at': datetime.now().isoformat()
            }).eq('job_id', job_id).execute()
        except Exception as e:
            logger.error(f"Failed to update job status: {e}")

    def _log_job_execution(
        self,
        job_id: str,
        job_type: str,
        campaign_id: str,
        user_id: str,
        status: str,
        results: Dict[str, Any]
    ):
        """Log job execution to database"""
        try:
            self.supabase.table('job_execution_logs').insert({
                'job_id': job_id,
                'job_type': job_type,
                'campaign_id': campaign_id,
                'user_id': user_id,
                'execution_time': datetime.now().isoformat(),
                'status': status,
                'results': results
            }).execute()

            # Update scheduled job status
            self._update_job_status(job_id, status)

        except Exception as e:
            logger.error(f"Failed to log job execution: {e}")

    def _mark_job_failed(self, job_id: str, error_message: str):
        """Mark a job as failed"""
        self._update_job_status(job_id, 'failed')
        logger.error(f"Job {job_id} failed: {error_message}")

    def _update_post_status(self, post_id: str, status: str, results: Dict[str, Any]):
        """Update social post status in database"""
        try:
            self.supabase.table('scheduled_posts').update({
                'status': status,
                'published_at': datetime.now().isoformat() if status == 'published' else None,
                'results': results
            }).eq('id', post_id).execute()
        except Exception as e:
            logger.error(f"Failed to update post status: {e}")

    def _update_email_status(self, email_id: str, status: str, results: Dict[str, Any]):
        """Update email status in database"""
        try:
            self.supabase.table('email_sequences').update({
                'status': status,
                'sent_at': datetime.now().isoformat() if status == 'sent' else None,
                'results': results
            }).eq('id', email_id).execute()
        except Exception as e:
            logger.error(f"Failed to update email status: {e}")


# Global scheduler instance
_scheduler_instance: Optional[TaskScheduler] = None

def get_task_scheduler() -> Optional[TaskScheduler]:
    """Get the global task scheduler instance"""
    return _scheduler_instance

def initialize_task_scheduler(supabase_client, email_agent=None, social_agent=None, content_agent=None):
    """Initialize the global task scheduler"""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = TaskScheduler(supabase_client, email_agent, social_agent, content_agent)
    return _scheduler_instance

def shutdown_task_scheduler():
    """Shutdown the global task scheduler"""
    global _scheduler_instance
    if _scheduler_instance:
        _scheduler_instance.shutdown()
        _scheduler_instance = None