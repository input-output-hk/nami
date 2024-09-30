import { MigrationView } from './migration-view.component';
import { MigrationState } from 'nami-migration-tool/migrator/migration-state.data';

export default {
  title: 'Nami Migration/State Flow',
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
    migrationState: MigrationState.InProgress,
    isLaceInstalled: false,
    hasWallet: true,
  },
};

export const InProgress = {
  args: {
    migrationState: MigrationState.InProgress,
    isLaceInstalled: true,
    hasWallet: true,
  },
};

export const Completed = {
  args: {
    migrationState: MigrationState.Completed,
    isLaceInstalled: true,
    hasWallet: true,
  },
};

export const NoWallet = {
  args: {
    migrationState: MigrationState.None,
    hasWallet: false,
  },
};
