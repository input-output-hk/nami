import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  displayUnit,
  getCurrentAccount,
  getUtxos,
  signTx,
} from '../../../api/extension';
import { Box, Stack, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import Loader from '../../../api/loader';
import UnitDisplay from '../components/unitDisplay';
import { ArrowRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import MiddleEllipsis from 'react-middle-ellipsis';
import AssetFingerprint from '@emurgo/cip14-js';
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/popover';
import Copy from '../components/copy';
import { Portal } from '@chakra-ui/portal';
import { Avatar } from '@chakra-ui/avatar';
import { FixedSizeList as List } from 'react-window';

const abs = (big) => {
  return big < 0 ? BigInt(big.toString().slice(1)) : big;
};

const SignTx = ({ request, controller }) => {
  const history = useHistory();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [fee, setFee] = React.useState('0');
  const [value, setValue] = React.useState({
    ownValue: null,
    externalValue: null,
  });
  const [property, setProperty] = React.useState({
    metadata: null,
    certificate: null,
    withdrawal: null,
    minting: null,
  });
  const [keyHashes, setKeyHashes] = React.useState({ kind: [], key: [] });

  const getFee = (tx) => {
    const fee = tx.body().fee().to_str();
    console.log(fee);
    setFee(fee);
  };

  const getProperties = (tx) => {
    const metadata = tx.metadata();
    const certificate = tx.body().certs();
    const withdrawal = tx.body().withdrawals();
    const minting = tx.body().multiassets();
    setProperty({ metadata, certificate, withdrawal, minting });
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
    const externalOutputs = {};
    if (!outputs) return;
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      const address = output.address().to_bech32();
      if (address === account.paymentAddr) {
        //own
        ownOutputValue.lovelace = Loader.Cardano.BigNum.from_str(
          ownOutputValue.lovelace
        )
          .checked_add(output.amount().coin())
          .to_str();
      } else {
        //external
        if (!externalOutputs[address])
          externalOutputs[address] = {
            lovelace: output.amount().coin().to_str(),
          };
        else
          externalOutputs[address].lovelace = Loader.Cardano.BigNum.from_str(
            externalOutputs[address].lovelace
          )
            .checked_add(output.amount().coin())
            .to_str();
      }

      if (!output.amount().multiasset()) continue;
      for (let j = 0; j < output.amount().multiasset().keys().len(); j++) {
        const policy = output.amount().multiasset().keys().get(j);
        const policyAssets = output.amount().multiasset().get(policy);
        for (let k = 0; k < policyAssets.keys().len(); k++) {
          const policyAsset = policyAssets.keys().get(k);
          const quantity = policyAssets.get(policyAsset);
          const asset =
            Buffer.from(policy.to_bytes(), 'hex').toString('hex') +
            Buffer.from(policyAsset.name(), 'hex').toString('hex');
          if (address === account.paymentAddr) {
            //own
            if (!ownOutputValue[asset])
              ownOutputValue[asset] = quantity.to_str();
            else
              ownOutputValue[asset] = Loader.Cardano.BigNum.from_str(
                ownOutputValue[asset]
              )
                .checked_add(quantity)
                .to_str();
          } else {
            //external
            if (!externalOutputs[address][asset])
              externalOutputs[address][asset] = quantity.to_str();
            else
              externalOutputs[address][asset] = Loader.Cardano.BigNum.from_str(
                externalOutputs[address][asset]
              )
                .checked_add(quantity)
                .to_str();
          }
        }
      }
    }

    console.log(externalOutputs);
    console.log(inputValue);
    console.log(ownOutputValue);

    // ownOutputValue.lovelace = Loader.Cardano.BigNum.from_str(
    //   ownOutputValue.lovelace
    // )
    //   .checked_add(tx.body().fee())
    //   .to_str();

    const involvedAssets = [
      ...new Set([...Object.keys(inputValue), ...Object.keys(ownOutputValue)]),
    ];
    console.log(Object.keys(inputValue));
    console.log(Object.keys(ownOutputValue));
    const ownOutputValueDifference = involvedAssets.map((asset) => {
      const difference =
        BigInt(inputValue[asset] || '') - BigInt(ownOutputValue[asset] || '');
      if (asset === 'lovelace') {
        return { unit: asset, quantity: difference };
      }
      const policy = asset.slice(0, 56);
      const name = asset.slice(56);
      const fingerprint = new AssetFingerprint(
        Buffer.from(policy, 'hex'),
        Buffer.from(name, 'hex')
      ).fingerprint();
      return { unit: asset, quantity: difference, fingerprint };
    });

    const externalValue = {};
    Object.keys(externalOutputs).forEach(
      (address) =>
        (externalValue[address] = Object.keys(externalOutputs[address]).map(
          (asset) => {
            if (asset === 'lovelace') {
              return {
                unit: asset,
                quantity: externalOutputs[address][asset],
              };
            }
            const policy = asset.slice(0, 56);
            const name = asset.slice(56);
            const fingerprint = new AssetFingerprint(
              Buffer.from(policy, 'hex'),
              Buffer.from(name, 'hex')
            ).fingerprint();
            return {
              unit: asset,
              quantity: externalOutputs[address][asset],
              fingerprint,
            };
          }
        ))
    );

    console.log(externalValue);
    const ownValue = ownOutputValueDifference.filter((v) => v.quantity != 0);
    setValue({ ownValue, externalValue });
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
    getProperties(tx);
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
          mt="4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          rounded="lg"
          shadow="md"
          padding="5"
        >
          {value.ownValue ? (
            (() => {
              const lovelace = value.ownValue.find(
                (v) => v.unit === 'lovelace'
              ).quantity;
              const assets = value.ownValue.filter(
                (v) => v.unit !== 'lovelace'
              );
              return (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                    fontWeight="bold"
                    color={lovelace <= 0 ? 'green.500' : 'red.500'}
                  >
                    <Text>{lovelace <= 0 ? '+' : '-'}</Text>
                    <UnitDisplay
                      quantity={abs(lovelace)}
                      decimals="6"
                      symbol="₳"
                    />
                  </Stack>
                  {assets.length > 0 && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                      ml="4"
                    >
                      <Text>and</Text>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                      >
                        {assets.filter((v) => v.quantity > 0).length > 0 && (
                          <Text color="red.500">
                            - {assets.filter((v) => v.quantity > 0).length}{' '}
                          </Text>
                        )}
                        {assets.filter((v) => v.quantity < 0).length > 0 &&
                          assets.filter((v) => v.quantity > 0).length > 0 && (
                            <Text>|</Text>
                          )}
                        {assets.filter((v) => v.quantity < 0).length > 0 && (
                          <Text color="green.500">
                            + {assets.filter((v) => v.quantity < 0).length}
                          </Text>
                        )}
                      </Stack>
                      <Text>assets</Text>{' '}
                      <AssetsPopover assets={assets} isDifference />
                    </Stack>
                  )}
                  <Box
                    height="1px"
                    mt="3"
                    mb="2"
                    width="50%"
                    background="GrayText"
                  />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                  >
                    <Text fontWeight="bold">Fee:</Text>
                    <UnitDisplay quantity={fee} decimals="6" symbol="₳" />
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
        {value.externalValue && Object.keys(value.externalValue).length > 0 && (
          <Box mt="6">
            <Text textAlign="center" fontSize="16" fontWeight="bold">
              Sending To
              <ArrowRightIcon ml="4" />
            </Text>
            <Box height="2" />
            <Scrollbars style={{ width: '100%' }} autoHeight autoHeightMax={80}>
              {Object.keys(value.externalValue).map((address) => {
                const lovelace = value.externalValue[address].find(
                  (v) => v.unit === 'lovelace'
                ).quantity;
                const assets = value.externalValue[address].filter(
                  (v) => v.unit !== 'lovelace'
                );
                return (
                  <>
                    <Stack direction="row" alignItems="center" mr="4">
                      <Copy label="Copied address" copy={address}>
                        <Box
                          width="200px"
                          whiteSpace="nowrap"
                          fontWeight="normal"
                        >
                          <MiddleEllipsis>
                            <span style={{ cursor: 'pointer' }}>{address}</span>
                          </MiddleEllipsis>
                        </Box>
                      </Copy>
                      <Box textAlign="center">
                        <UnitDisplay
                          fontWeight="bold"
                          quantity={lovelace}
                          decimals="6"
                          symbol="₳"
                        />
                        {assets.length > 0 && (
                          <Text mt="-1" fontWeight="bold">
                            + {assets.length} assets{' '}
                            <AssetsPopover assets={assets} />
                          </Text>
                        )}
                      </Box>
                    </Stack>
                    <Box height="2" />
                  </>
                );
              })}
            </Scrollbars>
          </Box>
        )}
        <Box
          bottom="24"
          position="absolute"
          maxWidth="90%"
          wordBreak="break-all"
          textAlign="center"
          fontSize="xs"
        >
          <Stack direction="row" alignItems="center" justifyContent="center">
            {property.minting && (
              <Text>
                <b>+ Minting</b>
              </Text>
            )}
            {property.certificate && (
              <Text>
                <b>+ Certificate</b>
              </Text>
            )}
            {property.withdrawal && (
              <Text>
                <b>+ Withdrawal</b>
              </Text>
            )}
            {property.metadata && (
              <Text>
                <b>+ Metadata</b>
              </Text>
            )}
          </Stack>
          <Text>
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
          bottom="8"
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

// Assets Popover

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = React.useCallback((scrollbarsRef) => {
    if (scrollbarsRef) {
      forwardedRef(scrollbarsRef.view);
    } else {
      forwardedRef(scrollbarsRef.view);
    }
  }, []);

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...style, overflow: 'hidden' }}
      onScroll={onScroll}
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

const AssetsPopover = ({ assets, isDifference }) => {
  const hexToAscii = (hex) => {
    var _hex = hex.toString();
    var str = '';
    for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
    return str;
  };
  return (
    <Popover
      offset={[
        isDifference
          ? assets.filter((v) => v.quantity < 0).length > 0 &&
            assets.filter((v) => v.quantity > 0).length > 0
            ? assets.length < 5
              ? -80
              : -70
            : assets.length < 5
            ? -60
            : -70
          : -125,
        0,
      ]}
    >
      <PopoverTrigger>
        <ChevronDownIcon cursor="pointer" />
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="full">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader fontWeight="bold">Assets</PopoverHeader>
          <PopoverBody p="-2" pr="-5">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              my="1"
            >
              {assets && (
                <List
                  outerElementType={CustomScrollbarsVirtualList}
                  height={200}
                  itemCount={assets.length}
                  itemSize={45}
                  width={385}
                  layout="vertical"
                >
                  {({ index, style }) => {
                    const asset = assets[index];
                    return (
                      <Box
                        style={style}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Box
                          width="110%"
                          ml="3"
                          display="flex"
                          alignItems="center"
                          justifyContent="start"
                        >
                          <Stack
                            width="100%"
                            fontSize="xs"
                            direction="row"
                            alignItems="center"
                            justifyContent="start"
                          >
                            <Avatar
                              userSelect="none"
                              size="xs"
                              name={hexToAscii(asset.unit.slice(56))}
                            />

                            <Box
                              textAlign="left"
                              width="200px"
                              whiteSpace="nowrap"
                              fontWeight="normal"
                            >
                              <Copy
                                label="Copied asset"
                                copy={asset.fingerprint}
                              >
                                <Box mb="-0.5">
                                  <MiddleEllipsis>
                                    <span>
                                      {hexToAscii(asset.unit.slice(56))}
                                    </span>
                                  </MiddleEllipsis>
                                </Box>
                                <Box
                                  whiteSpace="nowrap"
                                  fontSize="xx-small"
                                  fontWeight="thin"
                                >
                                  <MiddleEllipsis>
                                    <span>
                                      Policy: {asset.unit.slice(0, 56)}
                                    </span>
                                  </MiddleEllipsis>
                                </Box>
                              </Copy>
                            </Box>
                            <Box>
                              <Text
                                fontWeight="bold"
                                color={
                                  isDifference
                                    ? asset.quantity <= 0
                                      ? 'green.500'
                                      : 'red.500'
                                    : 'black'
                                }
                              >
                                {isDifference
                                  ? asset.quantity <= 0
                                    ? '+'
                                    : '-'
                                  : '+'}{' '}
                                {abs(asset.quantity).toString()}
                              </Text>
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    );
                  }}
                </List>
              )}
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default SignTx;
