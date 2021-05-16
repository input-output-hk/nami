import { enable, getBalance, isEnabled } from '../../api/webpage';

window.cardano = {
  getBalance: () => getBalance(),
  enable: () => enable(),
  isEnabled: () => isEnabled(),
};
