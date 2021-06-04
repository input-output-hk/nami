import { getNetwork } from '.';
import { EVENT, SENDER, TARGET } from '../../config/config';
import provider from '../../config/provider';
import Loader from '../loader';

export const onAccountChange = (callback) => {
  window.addEventListener('message', function responseHandler(e) {
    const response = e.data;
    if (
      typeof response !== 'object' ||
      response === null ||
      !response.target ||
      response.target !== TARGET ||
      !response.event ||
      response.event !== EVENT.accountChange ||
      !response.sender ||
      response.sender !== SENDER.extension
    )
      return;
    callback(response.data);
  });
};

export const initTx = async () => {
  const network = await getNetwork();
  const latest_block = await fetch(
    provider.api.base(network) + '/blocks/latest',
    { headers: provider.api.key(network) }
  ).then((res) => res.json());

  const p = await fetch(
    provider.api.base(network) + `/epochs/${latest_block.epoch}/parameters`,
    { headers: provider.api.key(network) }
  ).then((res) => res.json());

  return {
    linearFee: Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(p.min_fee_a.toString()),
      Loader.Cardano.BigNum.from_str(p.min_fee_b.toString())
    ),
    minUtxo: Loader.Cardano.BigNum.from_str(p.min_utxo),
    poolDeposit: Loader.Cardano.BigNum.from_str(p.pool_deposit),
    keyDeposit: oader.Cardano.BigNum.from_str(p.key_deposit),
  };
};
