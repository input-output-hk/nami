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
    hasWallet: true,
  },
};

export const WaitingForLace = {
  args: {
    migrationState: MigrationState.WaitingForLace,
    hasWallet: true,
  },
};

export const InProgress = {
  args: {
    migrationState: MigrationState.InProgress,
    hasWallet: true,
  },
};

export const Completed = {
  args: {
    migrationState: MigrationState.Completed,
    hasWallet: true,
  },
};

export const NoWallet = {
  args: {
    migrationState: MigrationState.None,
    hasWallet: false,
  },
};
