import { getNetwork } from './extension';
import provider from '../config/provider';

export const blockfrostRequest = async (endpoint, headers, body) => {
  const network = await getNetwork();
  return await fetch(provider.api.base(network.node) + endpoint, {
    headers: { ...provider.api.key(network.id), ...headers },
    method: body ? 'POST' : 'GET',
    body,
  }).then((res) => res.json());
};

export const currencyToSymbol = (currency) => {
  const currencyMap = { usd: '$', ada: '₳', eur: '€' };
  return currencyMap[currency];
};

export const hexToAscii = (hex) => {
  var _hex = hex.toString();
  var str = '';
  for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  return str;
};
