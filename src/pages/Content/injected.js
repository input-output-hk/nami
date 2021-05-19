import { enable, getBalance, isEnabled, signData } from '../../api/webpage';

window.cardano = {
  getBalance: () => getBalance(),
  enable: () => enable(),
  isEnabled: () => isEnabled(),
  signData: (address, message) => signData(address, message),
};
