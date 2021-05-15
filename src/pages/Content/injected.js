import api from '../../api/webpage';

window.cardano = {
  getBalance: () => api.getBalance(),
  enable: () => api.enable(),
};
