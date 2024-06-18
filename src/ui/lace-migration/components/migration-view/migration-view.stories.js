import { MigrationView } from './migration-view.component';
import { MigrationState } from "@xsy/nami-migration-tool/dist/migrator/migration-state.data";

export default {
  title: 'Migration',
  component: MigrationView,
  parameters: {
    layout: 'centered',
    actions: { argTypesRegex: '^on.*' },
  },
};

export const None = {
  args: {
    migrationState: MigrationState.None,
  },
};

export const WaitingForLace = {
  args: {
    migrationState: MigrationState.WaitingForLace,
  },
};

export const InProgress = {
  args: {
    migrationState: MigrationState.InProgress,
  },
};

export const Completed = {
  args: {
    migrationState: MigrationState.Completed,
  },
};
