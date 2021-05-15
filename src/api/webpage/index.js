import { METHOD } from '../../config/config';
import { Messaging } from '../messaging';

const getBalance = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.balance });
  return result.data;
};

const enable = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.enable });
  return result.data;
};

export default { getBalance, enable };
