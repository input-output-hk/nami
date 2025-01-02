export enum MigrationState {
  None = 'none',
  InProgress = 'in-progress',
  Completed = 'completed',
  Dismissed = 'dismissed',
  Dormant = 'dormant', // only available to set during canary phase
}

export const MIGRATION_KEY = 'laceMigration' as const;
export const DISMISS_MIGRATION_UNTIL = 'dismissMigrationUntil' as const;
