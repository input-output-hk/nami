import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getCurrentAccount,
  getUtxos,
  signTx,
} from '../../../api/extension';
import { Box, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import Loader from '../../../api/loader';

const SignTx = ({ request, controller }) => {
  const history = useHistory();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [fee, setFee] = React.useState(0);
  const [value, setValue] = React.useState(0);
  const [keyHashes, setKeyHashes] = React.useState({ kind: [], key: [] });

  const getFee = (tx) => {
    const fee = displayUnit(tx.body().fee().to_str());
    setFee(fee);
  };

  const getValue = (tx, utxos, account) => {
    const inputValue = {};
    const inputs = tx.body().inputs();
    for (let i = 0; i < inputs.len(); i++) {
      const txHash = Buffer.from(
        inputs.get(i).transaction_id().to_bytes(),
        'hex'
      ).toString('hex');
      const utxo = utxos.find((utxo) => utxo.txHash === txHash);
      if (utxo) {
        utxo.amount.forEach((amount) => {
          if (!inputValue[amount.unit])
            inputValue[amount.unit] = amount.quantity;
          else {
            const valueBigNum = Loader.Cardano.BigNum.from_str(
              inputValue[amount.unit]
            );
            const addedBigNum = Loader.Cardano.BigNum.from_str(amount.quantity);
            inputValue[amount.unit] = valueBigNum
              .checked_add(addedBigNum)
              .to_str();
          }
        });
      }
    }
    const outputs = tx.body().outputs();
    const ownOutputValue = { lovelace: '0' };
    if (!outputs) return;
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      if (output.address().to_bech32() === account.paymentAddr) {
        ownOutputValue.lovelace = Loader.Cardano.BigNum.from_str(
          ownOutputValue.lovelace
        )
          .checked_add(output.amount().coin())
          .to_str();
        if (!output.amount().multiasset()) continue;
        for (let j = 0; j < output.amount().multiasset().keys().len(); j++) {
          const policy = output.amount().multiasset().keys().get(j);
          const policyAssets = output.amount().multiasset().get(policy);
          for (let k = 0; k < policyAssets.keys().len(); k++) {
            const policyAsset = policyAssets.keys().get(k);
            const quantity = policyAssets.get(policyAsset);
            const asset =
              Buffer.from(policy.to_bytes(), 'hex').toString('hex') +
              Buffer.from(policyAsset.to_bytes(), 'hex').toString('hex');
            if (!ownOutputValue[asset])
              ownOutputValue[asset] = quantity.to_str();
            else
              ownOutputValue[asset] = Loader.Cardano.BigNum.from_str(
                ownOutputValue[asset]
              )
                .checked_add(quantity)
                .to_str();
          }
        }
      }
    }

    ownOutputValue.lovelace = Loader.Cardano.BigNum.from_str(
      ownOutputValue.lovelace
    )
      .checked_add(tx.body().fee())
      .to_str();

    setValue(
      displayUnit(
        Loader.Cardano.BigNum.from_str(inputValue.lovelace)
          .clamped_sub(Loader.Cardano.BigNum.from_str(ownOutputValue.lovelace))
          .to_str()
      )
    );
  };

  const getKeyHashes = async (tx, utxos, account) => {
    await Loader.load();
    let requiredKeyHashes = [];
    const baseAddr = Loader.Cardano.BaseAddress.from_address(
      Loader.Cardano.Address.from_bech32(account.paymentAddr)
    );
    const paymentKeyHash = Buffer.from(
      baseAddr.payment_cred().to_keyhash().to_bytes(),
      'hex'
    ).toString('hex');
    const stakeKeyHash = Buffer.from(
      baseAddr.stake_cred().to_keyhash().to_bytes(),
      'hex'
    ).toString('hex');

    //get key hashes from inputs
    const inputs = tx.body().inputs();
    for (let i = 0; i < inputs.len(); i++) {
      const txHash = Buffer.from(
        inputs.get(i).transaction_id().to_bytes(),
        'hex'
      ).toString('hex');
      if (utxos.some((utxo) => utxo.txHash === txHash)) {
        requiredKeyHashes.push(paymentKeyHash);
        break;
      }
    }

    const check = (keyHash) => {
      const tempKeyHashes = [...requiredKeyHashes];
      if (keyHash === paymentKeyHash || keyHash === stakeKeyHash) {
        tempKeyHashes.push(keyHash);
        if (new Set(tempKeyHashes).size >= 2) {
          requiredKeyHashes = tempKeyHashes;
          return true;
        }
      }
      return false;
    };

    //get key hashes from certificates
    const txBody = tx.body();
    const keyHashFromCert = (txBody) => {
      for (let i = 0; i < txBody.certs().len(); i++) {
        const cert = txBody.certs().get(i);
        if (cert.kind() === 0) {
          const credential = cert.as_stake_registration().stake_credential();
          if (credential.kind() === 0) {
            const keyHash = Buffer.from(
              credential.to_keyhash().to_bytes(),
              'hex'
            ).toString('hex');
            if (check(keyHash)) return;
          }
        } else if (cert.kind() === 1) {
          const credential = cert.as_stake_deregistration().stake_credential();
          if (credential.kind() === 0) {
            const keyHash = Buffer.from(
              credential.to_keyhash().to_bytes(),
              'hex'
            ).toString('hex');
            if (check(keyHash)) return;
          }
        } else if (cert.kind() === 2) {
          const credential = cert.as_stake_delegation().stake_credential();
          if (credential.kind() === 0) {
            const keyHash = Buffer.from(
              credential.to_keyhash().to_bytes(),
              'hex'
            ).toString('hex');
            if (check(keyHash)) return;
          }
        } else if (cert.kind() === 3) {
          const credential = cert
            .as_pool_registration()
            .pool_params()
            .pool_owners();

          const owners = cert
            .as_pool_registration()
            .pool_params()
            .pool_owners();
          for (let i = 0; i < owners.len(); i++) {
            const keyHash = Buffer.from(
              owners.get(i).to_bytes(),
              'hex'
            ).toString('hex');
            if (check(keyHash)) return;
          }
        } else if (cert.kind() === 6) {
          const instant_reward = cert
            .as_move_instantaneous_rewards_cert()
            .move_instantaneous_reward()
            .keys();
          for (let i = 0; i < instant_reward.len(); i++) {
            const credential = instant_reward.get(i);

            if (credential.kind() === 0) {
              const keyHash = Buffer.from(
                credential.to_keyhash().to_bytes(),
                'hex'
              ).toString('hex');
              if (check(keyHash)) return;
            }
          }
        }
      }
    };
    if (txBody.certs()) keyHashFromCert(txBody);

    //get key hashes from scripts
    const scripts = tx.witness_set().scripts();
    const keyHashFromScript = (scripts) => {
      for (let i = 0; i < scripts.len(); i++) {
        const script = scripts.get(i);
        if (script.kind() === 0) {
          const keyHash = Buffer.from(
            script.as_script_pubkey().addr_keyhash().to_bytes(),
            'hex'
          ).toString('hex');
          if (check(keyHash)) return;
        }
        if (script.kind() === 1) {
          return keyHashFromScript(script.as_script_all().native_scripts());
        }
        if (script.kind() === 2) {
          return keyHashFromScript(script.as_script_any().native_scripts());
        }
        if (script.kind() === 3) {
          return keyHashFromScript(script.as_script_n_of_k().native_scripts());
        }
      }
    };
    if (scripts && requiredKeyHashes.length < 2) keyHashFromScript(scripts);
    const keyKind = [];
    if (requiredKeyHashes.includes(paymentKeyHash)) keyKind.push('payment');
    if (requiredKeyHashes.includes(stakeKeyHash)) keyKind.push('stake');
    setKeyHashes({ key: requiredKeyHashes, kind: keyKind });
  };

  const getInfo = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
    const utxos = await getUtxos();
    await Loader.load();

    const tx = Loader.Cardano.Transaction.from_bytes(
      Buffer.from(request.data.tx, 'hex')
    );
    getFee(tx);
    getValue(tx, utxos, currentAccount);
    getKeyHashes(tx, utxos, currentAccount);
  };

  React.useEffect(() => {
    getInfo();
  }, []);
  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
        position="relative"
      >
        <Account account={account} />
        <Box mt="10" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            TRANSACTION SIGN
          </Text>
          <Text fontSize="lg" mt="-1">
            REQUEST
          </Text>
        </Box>
        <Box
          mt="10"
          width="76%"
          height="200px"
          rounded="lg"
          border="solid 2px"
          borderColor="teal.400"
          padding="2.5"
          wordBreak="break-all"
        >
          <Scrollbars autoHide>{request.data.tx}</Scrollbars>
        </Box>
        <Box mt="2.5" maxWidth="90%" wordBreak="break-all" textAlign="center">
          <Text fontSize="sm">
            <b>Fee:</b> {fee || '...'} ₳
          </Text>
          <Text fontSize="sm">
            <b>ADA spent:</b> {value || value === 0 ? value : '...'} ₳
          </Text>
          <Text fontSize="sm">
            <b>Required keys:</b>{' '}
            {keyHashes.kind.map((keyHash, index) =>
              keyHashes.kind.length > 1 &&
              index >= keyHashes.kind.length - 1 ? (
                <span key={index}>, {keyHash}</span>
              ) : (
                <span key={index}>{keyHash}</span>
              )
            )}
          </Text>
        </Box>
        <Box
          position="absolute"
          width="full"
          bottom="10"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Button
            variant="ghost"
            mr="3"
            onClick={async () => {
              await controller.returnData(null);
              window.close();
            }}
          >
            Cancel
          </Button>
          <Button
            isDisabled={keyHashes.key.length <= 0}
            colorScheme="orange"
            onClick={() => ref.current.openModal()}
          >
            Sign
          </Button>
        </Box>
      </Box>
      <ConfirmModal
        ref={ref}
        sign={(password) =>
          signTx(request.data.tx, keyHashes.key, password, account.index)
        }
        onConfirm={async (status, signedTx) => {
          if (status === true) {
            await controller.returnData(signedTx);
            window.close();
          }
        }}
      />
    </>
  );
};

export default SignTx;
