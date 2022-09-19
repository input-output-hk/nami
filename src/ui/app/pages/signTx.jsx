import React from 'react';
import {
  bytesAddressToBinary,
  extractKeyOrScriptHash,
  getCurrentAccount,
  getSpecificUtxo,
  getUtxos,
  signTx,
  signTxHW,
} from '../../../api/extension';
import { Box, Stack, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import Loader from '../../../api/loader';
import UnitDisplay from '../components/unitDisplay';
import { ChevronRightIcon } from '@chakra-ui/icons';
import MiddleEllipsis from 'react-middle-ellipsis';
import AssetFingerprint from '@emurgo/cip14-js';
import Copy from '../components/copy';
import { valueToAssets } from '../../../api/util';
import { TxSignError } from '../../../config/config';
import { useStoreState } from 'easy-peasy';
import {
  Image,
  Modal,
  ModalBody,
  ModalContent,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import JSONPretty from 'react-json-pretty';
import AssetsModal from '../components/assetsModal';

const abs = (big) => {
  return big < 0 ? big * BigInt(-1) : big;
};

const SignTx = ({ request, controller }) => {
  const settings = useStoreState((state) => state.settings.settings);
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [fee, setFee] = React.useState('0');
  const [value, setValue] = React.useState({
    ownValue: null,
    externalValue: null,
  });
  const [property, setProperty] = React.useState({
    metadata: false,
    certificate: false,
    withdrawal: false,
    minting: false,
    script: false,
    contract: false,
    datum: false,
  });
  const [tx, setTx] = React.useState('');
  // key kind can be payment and stake
  const [keyHashes, setKeyHashes] = React.useState({ kind: [], key: [] });
  const [isLoading, setIsLoading] = React.useState({
    loading: true,
    error: null,
  });

  const assetsModalRef = React.useRef();
  const detailsModalRef = React.useRef();

  const getFee = (tx) => {
    const fee = tx.body().fee().to_str();
    setFee(fee);
  };

  const getProperties = (tx) => {
    let metadata = tx.auxiliary_data() && tx.auxiliary_data().metadata();
    if (metadata) {
      const json = {};
      const keys = metadata.keys();
      for (let i = 0; i < keys.len(); i++) {
        const key = keys.get(i);
        json[key.to_str()] = JSON.parse(
          Loader.Cardano.decode_metadatum_to_json_str(metadata.get(key), 1)
        );
      }
      metadata = json;
    }

    const certificate = tx.body().certs();
    const withdrawal = tx.body().withdrawals();
    const minting = tx.body().mint();
    const script = tx.witness_set().native_scripts();
    let datum;
    let contract = tx.body().script_data_hash();
    const outputs = tx.body().outputs();
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      if (output.datum()) {
        datum = true;
        const prefix = bytesAddressToBinary(output.address().to_bytes()).slice(
          0,
          4
        );
        // from cardano ledger specs; if any of these prefixes match then it means the payment credential is a script hash, so it's a contract address
        if (
          prefix == '0111' ||
          prefix == '0011' ||
          prefix == '0001' ||
          prefix == '0101'
        ) {
          contract = true;
        }
        break;
      }
    }

    setProperty({
      metadata,
      certificate,
      withdrawal,
      minting,
      contract,
      script,
      datum,
    });
  };

  const getValue = async (tx, utxos, account) => {
    let inputValue = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str('0')
    );
    const inputs = tx.body().inputs();
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i);
      const inputTxHash = Buffer.from(
        input.transaction_id().to_bytes()
      ).toString('hex');
      const inputTxId = parseInt(input.index().to_str());
      const utxo = utxos.find((utxo) => {
        const utxoTxHash = Buffer.from(
          utxo.input().transaction_id().to_bytes()
        ).toString('hex');
        const utxoTxId = parseInt(utxo.input().index().to_str());
        return inputTxHash === utxoTxHash && inputTxId === utxoTxId;
      });
      if (utxo) {
        inputValue = inputValue.checked_add(utxo.output().amount());
      }
    }
    const outputs = tx.body().outputs();
    let ownOutputValue = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str('0')
    );
    const externalOutputs = {};
    if (!outputs) return;
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      const address = output.address().to_bech32();
      const hashBech32 = await extractKeyOrScriptHash(
        Buffer.from(output.address().to_bytes()).toString('hex')
      );
      // making sure funds at mangled addresses are also included
      if (hashBech32 === account.paymentKeyHashBech32) {
        //own
        ownOutputValue = ownOutputValue.checked_add(output.amount());
      } else {
        //external
        if (!externalOutputs[address]) {
          const value = Loader.Cardano.Value.new(output.amount().coin());
          if (output.amount().multiasset())
            value.set_multiasset(output.amount().multiasset());
          externalOutputs[address] = { value };
        } else
          externalOutputs[address].value = externalOutputs[
            address
          ].value.checked_add(output.amount());
        const prefix = bytesAddressToBinary(output.address().to_bytes()).slice(
          0,
          4
        );
        // from cardano ledger specs; if any of these prefixes match then it means the payment credential is a script hash, so it's a contract address
        if (
          prefix == '0111' ||
          prefix == '0011' ||
          prefix == '0001' ||
          prefix == '0101'
        ) {
          externalOutputs[address].script = true;
        }
        const datum = output.datum();
        if (datum)
          externalOutputs[address].datumHash = Buffer.from(
            datum.kind() === 0
              ? datum.as_data_hash().to_bytes()
              : Loader.Cardano.hash_plutus_data(
                  datum.as_data().get()
                ).to_bytes()
          ).toString('hex');
      }
    }

    inputValue = await valueToAssets(inputValue);
    ownOutputValue = await valueToAssets(ownOutputValue);

    const involvedAssets = [
      ...new Set([
        ...inputValue.map((asset) => asset.unit),
        ...ownOutputValue.map((asset) => asset.unit),
      ]),
    ];
    const ownOutputValueDifference = involvedAssets.map((unit) => {
      const leftValue = inputValue.find((asset) => asset.unit === unit);
      const rightValue = ownOutputValue.find((asset) => asset.unit === unit);
      const difference =
        BigInt(leftValue ? leftValue.quantity : '') -
        BigInt(rightValue ? rightValue.quantity : '');
      if (unit === 'lovelace') {
        return { unit, quantity: difference };
      }
      const policy = unit.slice(0, 56);
      const name = unit.slice(56);
      const fingerprint = new AssetFingerprint(
        Buffer.from(policy, 'hex'),
        Buffer.from(name, 'hex')
      ).fingerprint();
      return {
        unit,
        quantity: difference,
        fingerprint,
        name: (leftValue || rightValue).name,
        policy,
      };
    });

    const externalValue = {};
    for (const address of Object.keys(externalOutputs)) {
      externalValue[address] = {
        ...externalOutputs[address],
        value: await valueToAssets(externalOutputs[address].value),
      };
    }

    const ownValue = ownOutputValueDifference.filter((v) => v.quantity != 0);
    setValue({ ownValue, externalValue });
  };

  const getPaymentKeyHash = async (address) => {
    try {
      return Buffer.from(
        Loader.Cardano.BaseAddress.from_address(
          Loader.Cardano.Address.from_bytes(address.to_bytes())
        )
          .payment_cred()
          .to_keyhash()
          .to_bytes()
      ).toString('hex');
    } catch (e) {}
    try {
      return Buffer.from(
        Loader.Cardano.EnterpriseAddress.from_address(
          Loader.Cardano.Address.from_bytes(address.to_bytes())
        )
          .payment_cred()
          .to_keyhash()
          .to_bytes()
      ).toString('hex');
    } catch (e) {}
    try {
      return Buffer.from(
        Loader.Cardano.PointerAddress.from_address(
          Loader.Cardano.Address.from_bytes(address.to_bytes())
        )
          .payment_cred()
          .to_keyhash()
          .to_bytes()
      ).toString('hex');
    } catch (e) {}
    throw Error('Not supported address type');
  };

  const getKeyHashes = async (tx, utxos, account) => {
    let requiredKeyHashes = [];
    const baseAddr = Loader.Cardano.BaseAddress.from_address(
      Loader.Cardano.Address.from_bech32(account.paymentAddr)
    );
    const paymentKeyHash = Buffer.from(
      baseAddr.payment_cred().to_keyhash().to_bytes()
    ).toString('hex');
    const stakeKeyHash = Buffer.from(
      baseAddr.stake_cred().to_keyhash().to_bytes()
    ).toString('hex');

    //get key hashes from inputs
    const inputs = tx.body().inputs();
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i);
      const txHash = Buffer.from(input.transaction_id().to_bytes()).toString(
        'hex'
      );
      const index = parseInt(input.index().to_str());
      if (
        utxos.some(
          (utxo) =>
            Buffer.from(utxo.input().transaction_id().to_bytes()).toString(
              'hex'
            ) === txHash && parseInt(utxo.input().index().to_str()) === index
        )
      ) {
        requiredKeyHashes.push(paymentKeyHash);
      } else {
        requiredKeyHashes.push('<not_owned_key_hash>');
      }
    }

    //get key hashes from certificates
    const txBody = tx.body();
    const keyHashFromCert = (txBody) => {
      for (let i = 0; i < txBody.certs().len(); i++) {
        const cert = txBody.certs().get(i);
        if (cert.kind() === 0) {
          const credential = cert.as_stake_registration().stake_credential();
          if (credential.kind() === 0) {
            // stake registration doesn't required key hash
          }
        } else if (cert.kind() === 1) {
          const credential = cert.as_stake_deregistration().stake_credential();
          if (credential.kind() === 0) {
            const keyHash = Buffer.from(
              credential.to_keyhash().to_bytes()
            ).toString('hex');
            requiredKeyHashes.push(keyHash);
          }
        } else if (cert.kind() === 2) {
          const credential = cert.as_stake_delegation().stake_credential();
          if (credential.kind() === 0) {
            const keyHash = Buffer.from(
              credential.to_keyhash().to_bytes()
            ).toString('hex');
            requiredKeyHashes.push(keyHash);
          }
        } else if (cert.kind() === 3) {
          const owners = cert
            .as_pool_registration()
            .pool_params()
            .pool_owners();
          for (let i = 0; i < owners.len(); i++) {
            const keyHash = Buffer.from(owners.get(i).to_bytes()).toString(
              'hex'
            );
            requiredKeyHashes.push(keyHash);
          }
        } else if (cert.kind() === 4) {
          const operator = cert.as_pool_retirement().pool_keyhash().to_hex();
          requiredKeyHashes.push(operator);
        } else if (cert.kind() === 6) {
          const instant_reward = cert
            .as_move_instantaneous_rewards_cert()
            .move_instantaneous_reward()
            .as_to_stake_creds()
            .keys();
          for (let i = 0; i < instant_reward.len(); i++) {
            const credential = instant_reward.get(i);

            if (credential.kind() === 0) {
              const keyHash = Buffer.from(
                credential.to_keyhash().to_bytes()
              ).toString('hex');
              requiredKeyHashes.push(keyHash);
            }
          }
        }
      }
    };
    if (txBody.certs()) keyHashFromCert(txBody);

    // key hashes from withdrawals
    const withdrawals = txBody.withdrawals();
    const keyHashFromWithdrawal = (withdrawals) => {
      const rewardAddresses = withdrawals.keys();
      for (let i = 0; i < rewardAddresses.len(); i++) {
        const credential = rewardAddresses.get(i).payment_cred();
        if (credential.kind() === 0) {
          requiredKeyHashes.push(credential.to_keyhash().to_hex());
        }
      }
    };
    if (withdrawals) keyHashFromWithdrawal(withdrawals);

    //get key hashes from scripts
    const scripts = tx.witness_set().native_scripts();
    const keyHashFromScript = (scripts) => {
      for (let i = 0; i < scripts.len(); i++) {
        const script = scripts.get(i);
        if (script.kind() === 0) {
          const keyHash = Buffer.from(
            script.as_script_pubkey().addr_keyhash().to_bytes()
          ).toString('hex');
          requiredKeyHashes.push(keyHash);
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
    if (scripts) keyHashFromScript(scripts);

    //get keyHashes from required signers
    const requiredSigners = tx.body().required_signers();
    if (requiredSigners) {
      for (let i = 0; i < requiredSigners.len(); i++) {
        requiredKeyHashes.push(
          Buffer.from(requiredSigners.get(i).to_bytes()).toString('hex')
        );
      }
    }

    //get keyHashes from collateral
    const collateral = txBody.collateral();
    if (collateral) {
      for (let i = 0; i < collateral.len(); i++) {
        const c = collateral.get(i);
        const utxo = await getSpecificUtxo(
          Buffer.from(c.transaction_id().to_bytes()).toString('hex'),
          c.index()
        );
        if (utxo) {
          const address = Loader.Cardano.Address.from_bech32(utxo.address);
          requiredKeyHashes.push(await getPaymentKeyHash(address));
        }
      }
    }

    const keyKind = [];
    requiredKeyHashes = [...new Set(requiredKeyHashes)];
    if (requiredKeyHashes.includes(paymentKeyHash)) keyKind.push('payment');
    if (requiredKeyHashes.includes(stakeKeyHash)) keyKind.push('stake');
    if (keyKind.length <= 0) {
      setIsLoading((l) => ({
        ...l,
        error: 'Signature not possible',
      }));
      return;
    }
    setKeyHashes({ key: requiredKeyHashes, kind: keyKind });
  };

  const checkCollateral = (tx, utxos, account) => {
    const collateralInputs = tx.body().collateral();
    if (!collateralInputs) return;

    // checking all wallet utxos if used as collateral
    for (let i = 0; i < collateralInputs.len(); i++) {
      const collateral = collateralInputs.get(i);
      for (let j = 0; j < utxos.length; j++) {
        const input = utxos[j].input();
        if (
          Buffer.from(input.transaction_id().to_bytes()).toString('hex') ==
            Buffer.from(collateral.transaction_id().to_bytes()).toString(
              'hex'
            ) &&
          input.index() == collateral.index()
        ) {
          // collateral utxo is less than 50 ADA. That's also fine.
          if (
            utxos[j]
              .output()
              .amount()
              .coin()
              .compare(Loader.Cardano.BigNum.from_str('50000000')) <= 0
          )
            return;

          if (!account.collateral) {
            setIsLoading((l) => ({ ...l, error: 'Collateral not set' }));
            return;
          }

          if (
            !(
              Buffer.from(collateral.transaction_id().to_bytes()).toString(
                'hex'
              ) == account.collateral.txHash &&
              collateral.index() == account.collateral.txId
            )
          ) {
            setIsLoading((l) => ({ ...l, error: 'Invalid collateral used' }));
            return;
          }
        }
      }
    }
  };

  const getInfo = async () => {
    await Loader.load();
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
    let utxos = await getUtxos();
    const tx = Loader.Cardano.Transaction.from_bytes(
      Buffer.from(request.data.tx, 'hex')
    );
    setTx(request.data.tx);
    getFee(tx);
    await getValue(tx, utxos, currentAccount);
    checkCollateral(tx, utxos, currentAccount);
    await getKeyHashes(tx, utxos, currentAccount);
    getProperties(tx);
    setIsLoading((l) => ({ ...l, loading: false }));
  };
  const background = useColorModeValue('gray.100', 'gray.700');

  React.useEffect(() => {
    getInfo();
  }, []);
  return (
    <>
      {isLoading.loading ? (
        <Box
          height="100vh"
          width="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner color="teal" speed="0.5s" />
        </Box>
      ) : (
        <Box
          minHeight="100vh"
          display="flex"
          alignItems="center"
          flexDirection="column"
          position="relative"
        >
          <Account />
          <Box h="4" />
          <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'left'}
            width={'full'}
          >
            <Box w="6" />
            <Box
              width={8}
              height={8}
              background={background}
              rounded={'xl'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Image
                draggable={false}
                width={4}
                height={4}
                src={`chrome://favicon/size/16@2x/${request.origin}`}
              />
            </Box>
            <Box w="3" />
            <Text fontSize={'xs'} fontWeight="bold">
              {request.origin.split('//')[1]}
            </Text>
          </Box>
          <Box h="8" />
          <Box>This app requests a signature for:</Box>
          <Box h="4" />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            background={background}
            rounded="xl"
            width="80%"
            padding="5"
          >
            {value.ownValue ? (
              (() => {
                let lovelace = value.ownValue.find(
                  (v) => v.unit === 'lovelace'
                );
                lovelace = lovelace ? lovelace.quantity : '0';
                const assets = value.ownValue.filter(
                  (v) => v.unit !== 'lovelace'
                );
                return (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      fontSize={lovelace.toString().length < 14 ? '3xl' : '2xl'}
                      fontWeight="bold"
                      color={lovelace <= 0 ? 'teal.400' : 'red.400'}
                    >
                      <Text>{lovelace <= 0 ? '+' : '-'}</Text>
                      <UnitDisplay
                        hide
                        quantity={abs(lovelace)}
                        decimals="6"
                        symbol={settings.adaSymbol}
                      />
                    </Stack>
                    {assets.length > 0 && (
                      <Box
                        mt={2}
                        mb={1}
                        display={'flex'}
                        alignItems={'center'}
                        justifyContent={'center'}
                      >
                        {' '}
                        {(() => {
                          const positiveAssets = assets.filter(
                            (v) => v.quantity < 0
                          );
                          const negativeAssets = assets.filter(
                            (v) => v.quantity > 0
                          );
                          return (
                            <Box
                              display={'flex'}
                              alignItems={'center'}
                              justifyContent={'center'}
                            >
                              {' '}
                              {negativeAssets.length > 0 && (
                                <Button
                                  colorScheme={'red'}
                                  size={'xs'}
                                  onClick={() =>
                                    assetsModalRef.current.openModal({
                                      background: 'red.400',
                                      color: 'white',
                                      assets: negativeAssets,
                                      title: (
                                        <Box>
                                          Sending{' '}
                                          <Box as={'span'} color={'red.400'}>
                                            {negativeAssets.length}
                                          </Box>{' '}
                                          {negativeAssets.length == 1
                                            ? 'asset'
                                            : 'assets'}
                                        </Box>
                                      ),
                                    })
                                  }
                                >
                                  - {negativeAssets.length}{' '}
                                  {negativeAssets.length > 1
                                    ? 'Assets'
                                    : 'Asset'}
                                </Button>
                              )}
                              {negativeAssets.length > 0 &&
                                positiveAssets.length > 0 && <Box w={2} />}
                              {positiveAssets.length > 0 && (
                                <Button
                                  colorScheme={'teal'}
                                  size={'xs'}
                                  onClick={() =>
                                    assetsModalRef.current.openModal({
                                      background: 'teal.400',
                                      color: 'white',
                                      assets: positiveAssets,
                                      title: (
                                        <Box>
                                          Receiving{' '}
                                          <Box as={'span'} color={'teal.400'}>
                                            {positiveAssets.length}
                                          </Box>{' '}
                                          {positiveAssets.length == 1
                                            ? 'asset'
                                            : 'assets'}
                                        </Box>
                                      ),
                                    })
                                  }
                                >
                                  + {positiveAssets.length}{' '}
                                  {positiveAssets.length > 1
                                    ? 'Assets'
                                    : 'Asset'}
                                </Button>
                              )}
                            </Box>
                          );
                        })()}
                      </Box>
                    )}
                    <Box h={3} />
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                    >
                      <UnitDisplay
                        quantity={fee}
                        decimals="6"
                        symbol={settings.adaSymbol}
                      />
                      <Text fontWeight="bold">fee</Text>
                    </Stack>
                  </>
                );
              })()
            ) : (
              <Text fontSize="2xl" fontWeight="bold">
                ...
              </Text>
            )}
          </Box>
          <Box h={4} />
          <Button
            rounded={'xl'}
            size={'xs'}
            rightIcon={<ChevronRightIcon />}
            onClick={() => detailsModalRef.current.openModal()}
          >
            Details
          </Button>
          <Box
            position="absolute"
            width="full"
            bottom="3"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection={'column'}
          >
            {isLoading.error && (
              <>
                <Box py={2} px={4} rounded={'full'} background={background}>
                  <Text fontSize="xs" color={'red.300'}>
                    {isLoading.error}
                  </Text>
                </Box>
                <Box h={6} />
              </>
            )}

            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              width={'full'}
            >
              <Button
                height={'50px'}
                width={'180px'}
                onClick={async () => {
                  await controller.returnData({
                    error: TxSignError.UserDeclined,
                  });
                  window.close();
                }}
              >
                Cancel
              </Button>
              <Box w={3} />
              <Button
                height={'50px'}
                width={'180px'}
                isDisabled={isLoading.loading || isLoading.error}
                colorScheme="teal"
                onClick={() => ref.current.openModal(account.index)}
              >
                Sign
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <AssetsModal ref={assetsModalRef} />
      <DetailsModal
        ref={detailsModalRef}
        externalValue={value.externalValue ? value.externalValue : {}}
        settings={settings}
        assetsModalRef={assetsModalRef}
        property={property}
        keyHashes={keyHashes}
        tx={tx}
      />
      <ConfirmModal
        ref={ref}
        sign={async (password, hw) => {
          if (hw) {
            return await signTxHW(
              request.data.tx,
              keyHashes.key,
              account,
              hw,
              request.data.partialSign
            );
          }
          return await signTx(
            request.data.tx,
            keyHashes.key,
            password,
            account.index,
            request.data.partialSign
          );
        }}
        onConfirm={async (status, signedTx) => {
          if (status === true)
            await controller.returnData({
              data: Buffer.from(signedTx.to_bytes(), 'hex').toString('hex'),
            });
          else await controller.returnData({ error: signedTx });
          window.close();
        }}
      />
    </>
  );
};

const DetailsModal = React.forwardRef(
  (
    { externalValue, settings, property, keyHashes, tx, assetsModalRef },
    ref
  ) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const background = useColorModeValue('white', 'gray.800');
    const innerBackground = useColorModeValue('gray.100', 'gray.700');

    React.useImperativeHandle(ref, () => ({
      openModal() {
        onOpen();
      },
    }));
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalContent
          m={0}
          rounded="none"
          overflow={'hidden'}
          background={background}
        >
          <ModalBody p={0}>
            <Scrollbars style={{ width: '100%', height: '88vh' }}>
              <Box
                width={'full'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                flexDirection={'column'}
              >
                <Box h={8} />
                <Box
                  fontSize={'xl'}
                  fontWeight={'bold'}
                  maxWidth={'240px'}
                  textAlign={'center'}
                >
                  Details
                </Box>
                <Box h={6} />
                <Box
                  width={'full'}
                  px={8}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  flexDirection={'column'}
                >
                  {' '}
                  {Object.keys(externalValue).length > 0 && (
                    <Box width={'full'}>
                      <Text fontSize="md" fontWeight={'bold'}>
                        Recipients
                      </Text>
                      <Box height="4" />
                      {Object.keys(externalValue).map((address, index) => {
                        const lovelace = externalValue[address].value.find(
                          (v) => v.unit === 'lovelace'
                        ).quantity;
                        const assets = externalValue[address].value.filter(
                          (v) => v.unit !== 'lovelace'
                        );
                        return (
                          <Box key={index} mb="6">
                            <Stack direction="row" alignItems="center">
                              <Box
                                position={'relative'}
                                background={innerBackground}
                                rounded={'xl'}
                                p={2}
                              >
                                <Copy label="Copied address" copy={address}>
                                  <Box
                                    width="160px"
                                    whiteSpace="nowrap"
                                    fontWeight="normal"
                                    textAlign={'center'}
                                    display={'flex'}
                                    alignItems={'center'}
                                    justifyContent={'center'}
                                    flexDirection={'column'}
                                  >
                                    <MiddleEllipsis>
                                      <span style={{ cursor: 'pointer' }}>
                                        {address}
                                      </span>
                                    </MiddleEllipsis>
                                  </Box>
                                </Copy>
                                {externalValue[address].script && (
                                  <Box
                                    position={'absolute'}
                                    bottom={-2}
                                    left={4}
                                    background={innerBackground}
                                    mt={1}
                                    rounded="full"
                                    px={1}
                                    fontSize={'xs'}
                                    color={'orange'}
                                    fontWeight={'medium'}
                                  >
                                    {externalValue[address].datumHash ? (
                                      <Copy
                                        label="Copied datum hash"
                                        copy={externalValue[address].datumHash}
                                      >
                                        Contract
                                      </Copy>
                                    ) : (
                                      'Script'
                                    )}
                                  </Box>
                                )}
                              </Box>
                              <Box
                                textAlign="center"
                                width={'160px'}
                                display={'flex'}
                                alignItems={'center'}
                                justifyContent={'center'}
                                flexDirection={'column'}
                              >
                                <UnitDisplay
                                  hide
                                  fontSize={'sm'}
                                  fontWeight="bold"
                                  quantity={lovelace}
                                  decimals="6"
                                  symbol={settings.adaSymbol}
                                />
                                {assets.length > 0 && (
                                  <Button
                                    mt={1}
                                    size={'xs'}
                                    onClick={() =>
                                      assetsModalRef.current.openModal({
                                        assets: assets,
                                        title: (
                                          <Box>
                                            Address receiving{' '}
                                            <Box as={'span'}>
                                              {assets.length}
                                            </Box>{' '}
                                            {assets.length == 1
                                              ? 'asset'
                                              : 'assets'}
                                          </Box>
                                        ),
                                      })
                                    }
                                  >
                                    + {assets.length}{' '}
                                    {assets.length > 1 ? 'Assets' : 'Asset'}
                                  </Button>
                                )}
                              </Box>
                            </Stack>
                          </Box>
                        );
                      })}
                      <Box h={4} />
                    </Box>
                  )}
                  {property.metadata && (
                    <>
                      <Text width={'full'} fontSize="md" fontWeight={'bold'}>
                        Metadata
                      </Text>
                      <Box height="4" />
                      <Box
                        padding="2.5"
                        rounded={'xl'}
                        width={'full'}
                        height={'200px'}
                        background={innerBackground}
                      >
                        <Scrollbars autoHide>
                          <JSONPretty
                            id="json-pretty"
                            data={property.metadata}
                          ></JSONPretty>
                        </Scrollbars>
                      </Box>
                      <Box h={10} />
                    </>
                  )}
                  <Box fontSize="md" fontWeight={'bold'} width={'full'}>
                    Signing keys
                  </Box>
                  <Box height="4" />
                  <Box width={'full'} display={'flex'}>
                    {keyHashes.kind.map((keyHash, index) => (
                      <Box
                        mr={2}
                        py={1}
                        px={2}
                        background={innerBackground}
                        rounded={'full'}
                        key={index}
                      >
                        <Box
                          as={'b'}
                          color={keyHash == 'payment' ? 'teal.400' : 'orange'}
                        >
                          {keyHash}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Box h={10} />
                  {Object.keys(property).some((key) => property[key]) && (
                    <>
                      <Box fontSize="md" fontWeight={'bold'} width={'full'}>
                        Tags
                      </Box>
                      <Box height="4" />
                      <Box width={'full'} display={'flex'} flexWrap={'wrap'}>
                        {Object.keys(property)
                          .filter((p) => property[p])
                          .map((p, index) => (
                            <Box
                              mb={2}
                              mr={2}
                              py={1}
                              px={2}
                              background={innerBackground}
                              rounded={'full'}
                              key={index}
                            >
                              <Box as={'b'}>
                                {p == 'minting' && 'Minting'}
                                {p == 'certificate' && 'Certificate'}
                                {p == 'withdrawal' && 'Withdrawal'}
                                {p == 'metadata' && 'Metadata'}
                                {p == 'contract' && 'Contract'}
                                {p == 'script' && 'Script'}
                                {p == 'datum' && 'Datum'}
                              </Box>
                            </Box>
                          ))}
                      </Box>
                      <Box h={10} />
                    </>
                  )}
                  <Box h={5} />
                  <Text width={'full'} fontSize="md" fontWeight={'bold'}>
                    Raw transaction
                  </Text>
                  <Box height="4" />
                  <Box
                    padding="2.5"
                    rounded={'xl'}
                    width={'full'}
                    height={'200px'}
                    background={innerBackground}
                  >
                    <Scrollbars autoHide>{tx}</Scrollbars>
                  </Box>
                  <Box h={10} />
                </Box>
                <Box
                  position={'fixed'}
                  bottom={0}
                  width={'full'}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Box
                    width={'full'}
                    height={'12vh'}
                    background={background}
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    <Button onClick={onClose} width={'180px'}>
                      Back
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Scrollbars>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

export default SignTx;
