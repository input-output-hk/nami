import { MigrationView } from './migration-view.component';

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
    migrationState: 'none',
    hasWallet: true,
  },
};

export const WaitingForLace = {
  args: {
    migrationState: 'in-progress',
    isLaceInstalled: false,
    hasWallet: true,
  },
};

export const InProgress = {
  args: {
    migrationState: 'in-progress',
    isLaceInstalled: true,
    hasWallet: true,
  },
};

export const Completed = {
  args: {
    migrationState: 'completed',
    isLaceInstalled: true,
    hasWallet: true,
  },
};

export const NoWallet = {
  args: {
    migrationState: 'none',
    hasWallet: false,
  },
};
