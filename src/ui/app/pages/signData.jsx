import React from 'react';
import { useHistory } from 'react-router-dom';
import { getCurrentAccount, signData } from '../../../api/extension';
import { Box, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';

const SignData = ({ request, controller }) => {
  const history = useHistory();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const getAccount = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
  };

  React.useEffect(() => {
    getAccount();
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
          borderColor="teal.400"
          padding="2.5"
          wordBreak="break-all"
        >
          <Scrollbars autoHide>{request.data.message}</Scrollbars>
        </Box>
        <Box mt="2.5">
          <Text fontSize="xs">
            Data to be signed with{' '}
            <b>
              {request.data.address.startsWith('addr')
                ? 'payment'
                : request.data.address.startsWith('stake')
                ? 'stake'
                : 'unknown'}
            </b>{' '}
            key
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
            request.data.message,
            password,
            account.index
          )
        }
        onConfirm={async (status, signedMessage) => {
          if (status === true) {
            await controller.returnData(signedMessage);
            window.close();
          }
        }}
      />
    </>
  );
};

export default SignData;
