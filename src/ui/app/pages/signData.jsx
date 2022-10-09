import React, {useMemo} from 'react';
import { getCurrentAccount, isHW, signData, signDataCIP30 } from '../../../api/extension';
import { Box, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import Loader from '../../../api/loader';
import { DataSignError } from '../../../config/config';
import { Image, Spinner, useColorModeValue } from '@chakra-ui/react';

const SignData = ({ request, controller }) => {
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [payload, setPayload] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const background = useColorModeValue('gray.100', 'gray.700');
  const getAccount = async () => {
    const currentAccount = await getCurrentAccount();
    if (isHW(currentAccount.index)) setError('HW not supported');
    setAccount(currentAccount);
  };
  const getPayload = async () => {
    await Loader.load();
    const payload = Buffer.from(request.data.payload, 'hex').toString('utf8');
    setPayload(payload);
  };

  const signDataMsg = useMemo(() => {
    const result = [];
    payload.split(/\r?\n/).forEach(line => {
      result.push(
          <p style={{wordBreak: 'break-word', paddingBlockEnd: '8px'}}>
            {line}
          </p>
      );
    })
    return result;
  }, [payload]);

  const getAddress = async () => {
    await Loader.load();
    try {
      const baseAddr = Loader.Cardano.BaseAddress.from_address(
        Loader.Cardano.Address.from_bytes(
          Buffer.from(request.data.address, 'hex')
        )
      );
      if (!baseAddr) throw Error('Not a valid base address');
      setAddress('payment');
      return;
    } catch (e) {}
    try {
      const rewardAddr = Loader.Cardano.RewardAddress.from_address(
        Loader.Cardano.Address.from_bytes(
          Buffer.from(request.data.address, 'hex')
        )
      );
      if (!rewardAddr) throw Error('Not a valid base address');
      setAddress('stake');
      return;
    } catch (e) {}
    setAddress('unknown');
  };

  const loadData = async () => {
    await getAccount();
    await getPayload();
    await getAddress();
    setIsLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);
  return (
    <>
      {isLoading ? (
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
            width="76%"
            height="278px"
            rounded="xl"
            background={background}
            padding="2.5"
            wordBreak="break-all"
          >
            <Scrollbars autoHide>
              {signDataMsg}
            </Scrollbars>
          </Box>

          <Box
            position="absolute"
            width="full"
            bottom="3"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection={'column'}
          >
            <Box py={2} px={4} rounded={'full'} background={background}>
              {error ? (
                <Text wordBreak="break-all" fontSize="xs" color="red.300">
                  {error}
                </Text>
              ) : (
                <Text fontSize="xs">
                  Signing with{' '}
                  <Box
                    as={'b'}
                    color={
                      address == 'payment'
                        ? 'teal.400'
                        : address == 'stake'
                        ? 'orange'
                        : 'inherit'
                    }
                  >
                    {address}
                  </Box>{' '}
                  key
                </Text>
              )}
            </Box>
            <Box h={6} />
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
                    error: DataSignError.UserDeclined,
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
                isDisabled={error}
                colorScheme="teal"
                onClick={() => ref.current.openModal(account.index)}
              >
                Sign
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <ConfirmModal
        ref={ref}
        sign={(password) => request.data.CIP30 ?
            signDataCIP30(
              request.data.address,
              request.data.payload,
              password,
              account.index
            )
          :
          // deprecated soon
          signData(
            request.data.address,
            request.data.payload,
            password,
            account.index
          )
        }
        onConfirm={async (status, signedMessage) => {
          if (status === true)
            await controller.returnData({ data: signedMessage });
          else await controller.returnData({ error: signedMessage });
          window.close();
        }}
      />
    </>
  );
};

export default SignData;
