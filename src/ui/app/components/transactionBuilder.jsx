import React from 'react';
import {
  delegationTx,
  initTx,
  buildTx,
  signAndSubmit,
  withdrawalTx,
  signAndSubmitHW,
  undelegateTx,
} from '../../../api/extension/wallet';
import ConfirmModal from './confirmModal';
import UnitDisplay from './unitDisplay';
import {
  Box,
  Link,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useToast,
  Icon,
  UnorderedList,
  ListItem,
  InputGroup,
  InputRightElement,
  Input,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { GoStop } from 'react-icons/go';
// Assets
import IOHK from '../../../assets/img/iohk.svg';
import { ERROR, HW, TAB } from '../../../config/config';
import { useStoreState } from 'easy-peasy';
import Loader from '../../../api/loader';
import {
  createTab,
  getUtxos,
  removeCollateral,
  setCollateral,
  toUnit,
  getPoolMetadata,
} from '../../../api/extension';
import { FaRegFileCode } from 'react-icons/fa';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';

const PoolStates = {
  LOADING: 'LOADING',
  ERROR: 'ERROR',
  EDITING: 'EDITING',
  DONE: 'DONE',
};

const poolDefaultValue = {
  ticker: '',
  name: '',
  id: '',
  error: '',
  state: PoolStates.EDITING,
  showTooltip: false,
};

const poolRightElementStyle = (pool) => {
  if (pool.state === PoolStates.DONE || pool.state === PoolStates.ERROR) {
    return {
      width: 'auto',
      h: 'fit-content',
      top: '8px',
      right: '8px',
    };
  }

  return {
    width: '4.5rem',
    h: 'fit-content',
    top: '4px',
  };
};

const poolHasTicker = (pool) => {
  return pool.state === PoolStates.DONE && Boolean(pool.ticker);
};

const poolTooltipMessage = (pool) => {
  if (pool.state !== PoolStates.DONE) {
    return undefined;
  }

  const ticker = pool.ticker ? pool.ticker : '-';
  const name = pool.name ? pool.name : '-';

  return `${ticker} / ${name}`;
};

const TransactionBuilder = React.forwardRef(({ onConfirm }, ref) => {
  const capture = useCaptureEvent();
  const settings = useStoreState((state) => state.settings.settings);
  const toast = useToast();
  const {
    isOpen: isOpenCol,
    onOpen: onOpenCol,
    onClose: onCloseCol,
  } = useDisclosure();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState({
    fee: '',
    tx: null,
    account: null,
    stakeRegistration: '',
    rewards: '',
    ready: false,
    pool: { ...poolDefaultValue },
  });
  const COLLATERAL = '5';
  const delegationRef = React.useRef();
  const withdrawRef = React.useRef();
  const undelegateRef = React.useRef();
  const collateralRef = React.useRef();
  const accountIndex = React.useRef();

  const prepareDelegationTx = async () => {
    if (data.pool.id === '') return;

    setData((d) => ({
      ...d,
      pool: {
        ...d.pool,
        state: PoolStates.LOADING,
      },
    }));

    try {
      const metadata = await getPoolMetadata(data.pool.id).catch(() => {
        throw new Error('Stake pool not found');
      });

      const tx = await delegationTx(
        data.account,
        data.delegation,
        data.protocolParameters,
        metadata.hex
      ).catch(() => {
        throw new Error(
          'Transaction not possible (maybe insufficient balance)'
        );
      });

      setData((d) => ({
        ...d,
        fee: tx.body().fee().to_str(),
        tx,
        pool: {
          ticker: metadata.ticker,
          name: metadata.name,
          id: metadata.id,
          state: PoolStates.DONE,
        },
      }));
    } catch (e) {
      console.log(e);
      setData((d) => ({
        ...d,
        pool: {
          ...d.pool,
          error: e.message,
          state: PoolStates.ERROR,
        },
      }));
    }
  };

  React.useImperativeHandle(ref, () => ({
    async initDelegation(account, delegation) {
      setData({
        fee: '',
        stakeRegistration: '',
        rewards: '',
        ready: false,
        error: '',
        pool: { ...poolDefaultValue },
      });
      delegationRef.current.openModal(account.index);

      try {
        const protocolParameters = await initTx();

        setData((s) => ({
          ...s,
          account,
          delegation,
          protocolParameters,
          stakeRegistration:
            !delegation.active && protocolParameters.keyDeposit,
          ready: true,
        }));
      } catch {
        setData((d) => ({
          ...d,
          error: 'Transaction not possible (maybe insufficient balance)',
        }));
      }
    },
    async initWithdrawal(account, delegation) {
      setData({
        pool: { ...poolDefaultValue },
        fee: '',
        stakeRegistration: '',
        rewards: '',
        ready: false,
        error: '',
      });
      withdrawRef.current.openModal(account.index);
      const protocolParameters = await initTx();
      try {
        const tx = await withdrawalTx(account, delegation, protocolParameters);
        setData({
          pool: { ...poolDefaultValue },
          tx,
          account,
          rewards: delegation.rewards,
          fee: tx.body().fee().to_str(),
          ready: true,
        });
      } catch (e) {
        setData((d) => ({
          ...d,
          error: 'Transaction not possible (maybe reward amount too small)',
        }));
      }
    },
    async initUndelegate(account, delegation) {
      setData({
        pool: { ...poolDefaultValue },
        fee: '',
        stakeRegistration: '',
        rewards: '',
        ready: false,
        error: '',
      });
      undelegateRef.current.openModal(account.index);
      const protocolParameters = await initTx();
      try {
        const tx = await undelegateTx(account, delegation, protocolParameters);
        setData({
          pool: { ...poolDefaultValue },
          tx,
          account,
          fee: tx.body().fee().to_str(),
          ready: true,
        });
      } catch (e) {
        setData((d) => ({
          ...d,
          error: 'Transaction not possible (maybe account balance too low)',
        }));
      }
    },
    async initCollateral(account) {
      setData({
        pool: { ...poolDefaultValue },
        fee: '',
        stakeRegistration: '',
        rewards: '',
        ready: false,
        error: '',
      });
      if (account.collateral) {
        onOpenCol();
        return;
      }
      collateralRef.current.openModal(account.index);
      const protocolParameters = await initTx();
      const utxos = await getUtxos();
      await Loader.load();
      const outputs = Loader.Cardano.TransactionOutputs.new();
      outputs.add(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(account.paymentAddr),
          Loader.Cardano.Value.new(
            Loader.Cardano.BigNum.from_str(toUnit(COLLATERAL))
          )
        )
      );
      try {
        const tx = await buildTx(account, utxos, outputs, protocolParameters);
        setData({
          pool: { ...poolDefaultValue },
          tx,
          account,
          fee: tx.body().fee().to_str(),
          ready: true,
        });
      } catch (e) {
        setData((d) => ({
          ...d,
          error: 'Transaction not possible (maybe insufficient balance)',
        }));
      }
    },
  }));

  const error = data.error || data.pool.error;

  return (
    <>
      <ConfirmModal
        ready={data.ready && data.pool.state === PoolStates.DONE}
        title="Delegate your funds"
        sign={async (password, hw) => {
          if (hw) {
            if (hw.device === HW.trezor) {
              return createTab(
                TAB.trezorTx,
                `?tx=${Buffer.from(data.tx.to_bytes()).toString('hex')}`
              );
            }
            return await signAndSubmitHW(data.tx, {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              account: data.account,
              hw,
            });
          }
          return await signAndSubmit(
            data.tx,
            {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              accountIndex: data.account.index,
            },
            password
          );
        }}
        onConfirm={(status, signedTx) => {
          if (status === true) {
            capture(Events.StakingConfirmClick);
            toast({
              title: 'Delegation submitted',
              status: 'success',
              duration: 4000,
            });
          } else if (signedTx === ERROR.fullMempool) {
            toast({
              title: 'Transaction failed',
              description: 'Mempool full. Try again.',
              status: 'error',
              duration: 3000,
            });
          } else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 3000,
            });
          delegationRef.current.closeModal();
        }}
        info={
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Text fontSize="sm">
              Enter the Stake Pool ID to delegate your funds and start receiving
              rewards. Alternatively, head to{' '}
              <Link
                fontWeight="semibold"
                onClick={() => window.open('https://pool.pm')}
              >
                https://pool.pm
              </Link>
              , connect your Nami wallet and delegate to a stake pool of your
              choice
            </Text>
            <Box h="6" />
            <Tooltip
              label={poolTooltipMessage(data.pool)}
              placement="top"
              isOpen={data.pool.showTooltip}
            >
              <InputGroup size="md">
                <Input
                  variant="filled"
                  h={8}
                  pr={poolHasTicker(data.pool) ? '2rem' : '4.5rem'}
                  pl={'0.5rem'}
                  type="text"
                  fontSize="14px"
                  color={
                    data.pool.state === PoolStates.DONE ? '#A3AEBE' : undefined
                  }
                  value={data.pool.id}
                  onChange={(e) => {
                    setData((s) => ({
                      ...s,
                      pool: {
                        ...s.pool,
                        id: e.target.value,
                        state: PoolStates.EDITING,
                      },
                    }));
                  }}
                  placeholder="Enter Pool ID"
                  onKeyDown={(e) => {
                    if (e.key == 'Enter') prepareDelegationTx();
                  }}
                  onMouseEnter={() => {
                    setData((s) => ({
                      ...s,
                      pool: {
                        ...s.pool,
                        showTooltip: s.pool.state === PoolStates.DONE,
                      },
                    }));
                  }}
                  onMouseLeave={() => {
                    setData((s) => ({
                      ...s,
                      pool: {
                        ...s.pool,
                        showTooltip: false,
                      },
                    }));
                  }}
                />
                <InputRightElement {...poolRightElementStyle(data.pool)}>
                  {data.pool.state === PoolStates.EDITING && (
                    <Button
                      h={6}
                      size="sm"
                      colorScheme="teal"
                      disabled={data.pool.id === '' || data.pool.isLoading}
                      isLoading={data.pool.isLoading}
                      onClick={() => prepareDelegationTx()}
                    >
                      Verify
                    </Button>
                  )}
                  {data.pool.state === PoolStates.DONE && (
                    <CheckIcon color="teal.500" />
                  )}
                  {data.pool.state === PoolStates.ERROR && (
                    <WarningIcon color="red.300" />
                  )}
                </InputRightElement>
              </InputGroup>
            </Tooltip>
            {error ? (
              <Box textAlign="center" mb="4" color="red.300" mt="4">
                {error}
              </Box>
            ) : (
              <Box fontSize="sm">
                {data.stakeRegistration && (
                  <Box
                    mt="1"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontWeight="bold">+ Stake Registration:</Text>
                    <Box w="1" />
                    <UnitDisplay
                      hide
                      quantity={data.stakeRegistration}
                      decimals={6}
                      symbol={settings.adaSymbol}
                    />
                  </Box>
                )}
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Text fontWeight="bold">+ Fee:</Text>
                  <Box w="1" />
                  <UnitDisplay
                    quantity={data.fee}
                    decimals={6}
                    symbol={settings.adaSymbol}
                  />
                </Box>
                <Box h="4" />
              </Box>
            )}
          </Box>
        }
        ref={delegationRef}
      />
      <ConfirmModal
        sign={async (password, hw) => {
          if (hw) {
            if (hw.device === HW.trezor) {
              return createTab(
                TAB.trezorTx,
                `?tx=${Buffer.from(data.tx.to_bytes()).toString('hex')}`
              );
            }
            return await signAndSubmitHW(data.tx, {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              account: data.account,
              hw,
            });
          }
          return await signAndSubmit(
            data.tx,
            {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              accountIndex: data.account.index,
            },
            password
          );
        }}
        onConfirm={(status, signedTx) => {
          if (status === true)
            toast({
              title: 'Withdrawal submitted',
              status: 'success',
              duration: 4000,
            });
          else if (signedTx === ERROR.fullMempool) {
            toast({
              title: 'Withdrawal failed',
              description: 'Mempool full. Try again.',
              status: 'error',
              duration: 3000,
            });
          } else
            toast({
              title: 'Withdrawal failed',
              status: 'error',
              duration: 3000,
            });
          withdrawRef.current.closeModal();
        }}
        ready={data.ready}
        title="Withdraw Rewards"
        info={
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            {data.error ? (
              <Box textAlign="center" mb="4" color="red.300">
                {data.error}
              </Box>
            ) : (
              <Box fontSize="sm">
                <Box
                  mt="-2"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <UnitDisplay
                    fontSize="xl"
                    fontWeight="bold"
                    color="teal.500"
                    hide
                    quantity={data.rewards}
                    decimals={6}
                    symbol={settings.adaSymbol}
                  />
                </Box>
                <Box h="3" />
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Text fontWeight="bold">+ Fee:</Text>
                  <Box w="1" />
                  <UnitDisplay
                    quantity={data.fee}
                    decimals={6}
                    symbol={settings.adaSymbol}
                  />
                </Box>
                <Box h="4" />
              </Box>
            )}
          </Box>
        }
        ref={withdrawRef}
      />
      <ConfirmModal
        ready={data.ready}
        title="Stake deregistration"
        sign={async (password, hw) => {
          if (hw) {
            if (hw.device === HW.trezor) {
              return createTab(
                TAB.trezorTx,
                `?tx=${Buffer.from(data.tx.to_bytes()).toString('hex')}`
              );
            }
            return await signAndSubmitHW(data.tx, {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              account: data.account,
              hw,
            });
          }
          return await signAndSubmit(
            data.tx,
            {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              accountIndex: data.account.index,
            },
            password
          );
        }}
        onConfirm={(status, signedTx) => {
          if (status === true) {
            capture(Events.StakingUnstakeConfirmClick);
            toast({
              title: 'Deregistration submitted',
              status: 'success',
              duration: 4000,
            });
          } else if (signedTx === ERROR.fullMempool) {
            toast({
              title: 'Transaction failed',
              description: 'Mempool full. Try again.',
              status: 'error',
              duration: 3000,
            });
          } else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 3000,
            });
          undelegateRef.current.closeModal();
        }}
        info={
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Icon as={GoStop} w={50} h={50} color="red.500" />
            <Box h="4" />
            <Text fontSize="sm">
              Going forward with deregistration will have the following effects:
            </Text>
            <UnorderedList mt="10px">
              <ListItem>You will no longer receive rewards.</ListItem>
              <ListItem>
                Rewards from the 2 previous epoch will be lost.
              </ListItem>
              <ListItem>Full reward balance will be withdrawn.</ListItem>
              <ListItem>The 2 ADA deposit will be refunded.</ListItem>
              <ListItem>
                You will have to re-register and wait 20 days to receive rewards
                again.
              </ListItem>
            </UnorderedList>
            <Box h="6" />
            {data.error ? (
              <Box textAlign="center" mb="4" color="red.300">
                {data.error}
              </Box>
            ) : (
              <Box fontSize="sm">
                <Box
                  mt="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontWeight="bold">+ Stake Deregistration</Text>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Text fontWeight="bold">+ Fee:</Text>
                  <Box w="1" />
                  <UnitDisplay
                    quantity={data.fee}
                    decimals={6}
                    symbol={settings.adaSymbol}
                  />
                </Box>
                <Box h="4" />
              </Box>
            )}
          </Box>
        }
        ref={undelegateRef}
      />
      <ConfirmModal
        ready={data.ready}
        title={
          <Box display="flex" alignItems="center">
            <Icon as={FaRegFileCode} mr="2" /> <Box>Collateral</Box>
          </Box>
        }
        sign={async (password, hw) => {
          if (hw) {
            if (hw.device === HW.trezor) {
              return createTab(
                TAB.trezorTx,
                `?tx=${Buffer.from(data.tx.to_bytes()).toString('hex')}`
              );
            }
            return await signAndSubmitHW(data.tx, {
              keyHashes: [data.account.paymentKeyHash],
              account: data.account,
              hw,
            });
          }
          return await signAndSubmit(
            data.tx,
            {
              keyHashes: [data.account.paymentKeyHash],
              accountIndex: data.account.index,
            },
            password
          );
        }}
        onCloseBtn={() => {
          capture(Events.SettingsCollateralConfirmClick);
        }}
        onConfirm={async (status, signedTx) => {
          if (status === true) {
            capture(Events.SettingsCollateralConfirmClick);
            await setCollateral({
              txHash: signedTx,
              txId: 0,
              lovelace: toUnit(COLLATERAL),
            });
            toast({
              title: 'Collateral added',
              status: 'success',
              duration: 4000,
            });
            onConfirm();
          } else if (signedTx === ERROR.fullMempool) {
            toast({
              title: 'Transaction failed',
              description: 'Mempool full. Try again.',
              status: 'error',
              duration: 3000,
            });
          } else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 3000,
            });
          collateralRef.current.closeModal();
        }}
        info={
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Text fontSize="sm">
              Add collateral in order to interact with smart contracts on
              Cardano:
              <Box mt="3">The recommended collateral amount is</Box>
              <Box mb="3" width="full" textAlign="center">
                <b style={{ fontSize: 16 }}>5 {settings.adaSymbol}</b>
              </Box>{' '}
              The amount is separated from your account balance, you can choose
              to return it to your balance at any time.
              <br />
              <Link
                fontWeight="semibold"
                onClick={() => window.open('https://namiwallet.io')}
              >
                Read more
              </Link>
            </Text>
            <Box h="6" />
            {data.error ? (
              <Box textAlign="center" mb="4" color="red.300">
                {data.error}
              </Box>
            ) : (
              <Box fontSize="sm">
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Text fontWeight="bold">+ Fee:</Text>
                  <Box w="1" />
                  <UnitDisplay
                    quantity={data.fee}
                    decimals={6}
                    symbol={settings.adaSymbol}
                  />
                </Box>
                <Box h="4" />
              </Box>
            )}
          </Box>
        }
        ref={collateralRef}
      />

      <Modal size="xs" isCentered isOpen={isOpenCol} onClose={onCloseCol}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">
            {' '}
            <Box display="flex" alignItems="center">
              <Icon as={FaRegFileCode} mr="2" /> <Box>Collateral</Box>
            </Box>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm">
              Your collateral amount is{' '}
              <b style={{ fontSize: 16 }}>5 {settings.adaSymbol}</b>.<br />
              <br /> When removing the collateral amount, it is returned to the
              account balance, but disables interactions with smart contracts.
            </Text>
            <Box h="6" />
            <Box h="3" />
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Button
                isDisabled={isLoading}
                isLoading={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  await removeCollateral();
                  capture(Events.SettingsCollateralReclaimCollateralClick);
                  toast({
                    title: 'Collateral removed',
                    status: 'success',
                    duration: 4000,
                  });
                  onConfirm(true);
                  onCloseCol();
                  setIsLoading(false);
                }}
              >
                Remove
              </Button>

              <Box h="4" />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

export default TransactionBuilder;
