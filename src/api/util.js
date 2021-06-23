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
