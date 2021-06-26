import { Box, Link, Text } from '@chakra-ui/layout';
import React from 'react';
import {
  delegationTx,
  initTx,
  signAndSubmit,
} from '../../../api/extension/wallet';
import ConfirmModal from './confirmModal';
import UnitDisplay from './unitDisplay';
import { Backpack } from 'react-kawaii';
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

const TransactionBuilder = React.forwardRef((props, ref) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = React.useState({
    fee: '',
    tx: null,
    account: null,
    stakeRegistration: '',
    ready: false,
  });
  const [showDelegation, setShowDelegation] = React.useState(true);
  const [ready, setReady] = React.useState(false);
  const delegationRef = React.useRef();
  const withdrawRef = React.useRef();
  React.useImperativeHandle(ref, () => ({
    async initDelegation(account, delegation) {
      console.log(delegation);
      if (
        delegation.poolId ===
        'pool19f6guwy97mmnxg9dz65rxyj8hq07qxud886hamyu4fgfz7dj9gl' // BERRY
      ) {
        onOpen();
        return;
      }
      setData({ fee: '', stakeRegistration: '', ready: false });
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
              !delegation.active && protocolParameters.keyDeposit.to_str(),
            ready: true,
          });
        } catch (e) {
          checkTx(count + 1);
        }
      };
      checkTx(0);
    },
    async initWithdrawal() {
      setData({ fee: '', stakeRegistration: '', ready: false });
      showDelegation(false);
      withdrawRef.current.openModal();
      setData({
        fee: tx.body().fee().to_str(),
        ready: true,
      });
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
              and earn <b>5%</b> staking rewards per year.
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
                      symbol="₳"
                    />
                  </Box>
                )}
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Text fontWeight="bold">+ Fee:</Text>
                  <Box w="1" />
                  <UnitDisplay quantity={data.fee} decimals={6} symbol="₳" />
                </Box>
                <Box h="4" />
              </Box>
            )}
          </Box>
        }
        ref={delegationRef}
      />
      <ConfirmModal
        ready={data.ready}
        info={
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            Withdraw
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
              mt="2"
            >
              <Backpack size={100} mood="lovestruck" color="#61DDBC" />
              <Box height="2" />
              <Text fontWeight="bold" color="GrayText">
                Already delegated to Berry
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
