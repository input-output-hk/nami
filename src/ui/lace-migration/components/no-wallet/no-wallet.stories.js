import { NoWallet } from './no-wallet.component';

const meta = {
  title: 'Nami Migration/Screens/NoWallet',
  component: NoWallet,
  parameters: {
    layout: 'centered',
  },
  args: {
    isLaceInstalled: true,
    onAction: () => {},
  },
};

export default meta;

export const Primary = {};
