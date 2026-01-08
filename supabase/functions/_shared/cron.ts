// Cron configuration for Supabase Edge Functions
// This file defines the scheduled execution of autopilot functions

export const cronConfig = {
  // Daily autopilot orchestrator - runs every day at 2 AM UTC
  'autopilot-orchestrator': {
    schedule: '0 2 * * *', // Cron format: minute hour day month weekday
    description: 'Daily campaign optimization and lead syncing'
  },

  // Weekly report generator - runs every Monday at 9 AM UTC
  'autopilot-weekly-report': {
    schedule: '0 9 * * 1', // Every Monday at 9 AM
    description: 'Weekly performance report generation'
  },

  // AI model updater - runs on 1st of every month at 3 AM UTC
  'ai-model-updater': {
    schedule: '0 3 1 * *', // First day of every month at 3 AM
    description: 'Discover and update latest AI models from all providers'
  }
};

/*
Cron Schedule Format:
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *

Examples:
'0 2 * * *'     - Every day at 2:00 AM
'0 9 * * 1'     - Every Monday at 9:00 AM
'*\/15 * * * *' - Every 15 minutes
'0 *\/6 * * *'  - Every 6 hours
'0 0 1 * *'     - First day of every month at midnight
*/
