import React from 'react';
import { useHistory } from 'react-router-dom';
import { getCurrentAccount, signData } from '../../../api/extension';
import { Box, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import Loader from '../../../api/loader';
import { DataSignError } from '../../../config/config';

const SignData = ({ request, controller }) => {
  const history = useHistory();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const [payload, setPayload] = React.useState('');
  const [address, setAddress] = React.useState('');
  const getAccount = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
  };
  const getPayload = async () => {
    await Loader.load();
    const payload = Buffer.from(request.data.payload, 'hex').toString('utf8');
    setPayload(payload);
  };

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

  React.useEffect(() => {
    getAccount();
    getPayload();
    getAddress();
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
        <Account />
        <Box mt="6" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            DATA SIGN
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
          borderColor="teal.500"
          padding="2.5"
          wordBreak="break-all"
        >
          <Scrollbars autoHide>{payload}</Scrollbars>
        </Box>
        <Box mt="2.5">
          <Text fontSize="xs">
            Data to be signed with <b>{address}</b> key
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
              await controller.returnData({
                error: DataSignError.UserDeclined,
              });
              window.close();
            }}
          >
            Cancel
          </Button>
          <Button colorScheme="orange" onClick={() => ref.current.openModal()}>
            Sign
          </Button>
        </Box>
      </Box>
      <ConfirmModal
        ref={ref}
        sign={(password) =>
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
