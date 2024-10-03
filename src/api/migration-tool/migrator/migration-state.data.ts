export enum MigrationState {
  None = 'none',
  InProgress = 'in-progress',
  Completed = 'completed',
  Dismissed = 'dismissed',
}

export const MIGRATION_KEY = 'laceMigration' as const;
export const DISMISS_MIGRATION_UNTIL = 'dismissMigrationUntil' as const;
