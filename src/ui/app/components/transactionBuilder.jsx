import { Box, Link, Text } from '@chakra-ui/layout';
import React from 'react';
import {
  delegationTx,
  initTx,
  signAndSubmit,
  withdrawalTx,
} from '../../../api/extension/wallet';
import ConfirmModal from './confirmModal';
import UnitDisplay from './unitDisplay';
import {
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useToast,
} from '@chakra-ui/react';

// Assets
import Berry from '../../../assets/img/berry.svg';
import { ERROR } from '../../../config/config';
import { useStoreState } from 'easy-peasy';

const TransactionBuilder = React.forwardRef((props, ref) => {
  const settings = useStoreState((state) => state.settings.settings);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = React.useState({
    fee: '',
    tx: null,
    account: null,
    stakeRegistration: '',
    rewards: '',
    ready: false,
  });
  const delegationRef = React.useRef();
  const withdrawRef = React.useRef();
  React.useImperativeHandle(ref, () => ({
    async initDelegation(account, delegation) {
      if (
        delegation.poolId ===
        'pool19f6guwy97mmnxg9dz65rxyj8hq07qxud886hamyu4fgfz7dj9gl' // BERRY
      ) {
        onOpen();
        return;
      }
      setData({
        fee: '',
        stakeRegistration: '',
        rewards: '',
        ready: false,
        error: '',
      });
      delegationRef.current.openModal();
      const protocolParameters = await initTx();
      const checkTx = async (count) => {
        if (count >= 5) {
          setData((d) => ({
            ...d,
            error: 'Transaction not possible (maybe insufficient balance)',
          }));
          throw ERROR.txNotPossible;
        }
        try {
          const tx = await delegationTx(
            account,
            delegation,
            protocolParameters
          );
          setData({
            fee: tx.body().fee().to_str(),
            tx,
            account,
            stakeRegistration:
              !delegation.active && protocolParameters.keyDeposit,
            ready: true,
          });
        } catch (e) {
          checkTx(count + 1);
        }
      };
      checkTx(0);
    },
    async initWithdrawal(account, delegation) {
      setData({
        fee: '',
        stakeRegistration: '',
        rewards: '',
        ready: false,
        error: '',
      });
      withdrawRef.current.openModal();
      const protocolParameters = await initTx();
      try {
        const tx = await withdrawalTx(account, delegation, protocolParameters);
        setData({
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
  }));
  return (
    <>
      <ConfirmModal
        ready={data.ready}
        title="Delegate to Berry"
        sign={(password) =>
          signAndSubmit(
            data.tx,
            {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              accountIndex: data.account.index,
            },
            password
          )
        }
        onConfirm={(status, signedTx) => {
          if (status === true)
            toast({
              title: 'Delegation submitted',
              status: 'success',
              duration: 5000,
            });
          else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 5000,
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
            <Image src={Berry} width="40px" />
            <Box h="4" />
            <Text fontSize="sm">
              Support the development of Nami Wallet by delegating to{' '}
              <Link
                fontWeight="semibold"
                onClick={() => window.open('https://pipool.online')}
              >
                Berry Pool
              </Link>{' '}
              and earn approximately <b>5%</b> staking rewards per year.
            </Text>
            <Box h="6" />
            {data.error ? (
              <Box textAlign="center" mb="4" color="red.300">
                {data.error}
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
        sign={(password) =>
          signAndSubmit(
            data.tx,
            {
              keyHashes: [
                data.account.paymentKeyHash,
                data.account.stakeKeyHash,
              ],
              accountIndex: data.account.index,
            },
            password
          )
        }
        onConfirm={(status, signedTx) => {
          if (status === true)
            toast({
              title: 'Withdrawal submitted',
              status: 'success',
              duration: 5000,
            });
          else
            toast({
              title: 'Transaction failed',
              status: 'error',
              duration: 5000,
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
                  <Text fontSize="md" color="green.500" fontWeight="bold">
                    Rewards:{' '}
                  </Text>
                  <Box w="1" />
                  <UnitDisplay
                    fontSize="md"
                    fontWeight="bold"
                    color="green.500"
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

      <Modal size="xs" isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">{'Delegate to Berry'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Image src={Berry} width="60px" />
              <Box height="4" />
              <Text textAlign="center" fontWeight="bold" color="GrayText">
                Already delegated to Berry and earning rewards!
              </Text>
              <Box h="6" />
              <Button
                size="sm"
                colorScheme="teal"
                onClick={() =>
                  window.open(
                    'https://adapools.org/pool/2a748e3885f6f73320ad16a8331247b81fe01b8d39f57eec9caa5091'
                  )
                }
              >
                View Pool
              </Button>
              <Box h="3" />
              <Button size="sm" onClick={() => onClose()}>
                Close
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
