import React from 'react';
import { useHistory } from 'react-router-dom';
import { getCurrentAccount, signData } from '../../../api/extension';
import { Box, Stack, Text } from '@chakra-ui/layout';
import Account from '../components/account';
import Scrollbars from 'react-custom-scrollbars';
import { Button, IconButton } from '@chakra-ui/button';
import ConfirmModal from '../components/confirmModal';
import { ChevronLeftIcon, Icon } from '@chakra-ui/icons';
import { BsArrowUpRight } from 'react-icons/bs';
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
} from '@chakra-ui/input';
import Autocomplete from '../components/autocomplete';

const Send = () => {
  const history = useHistory();
  const ref = React.useRef();
  const [account, setAccount] = React.useState(null);
  const getAccount = async () => {
    const currentAccount = await getCurrentAccount();
    setAccount(currentAccount);
  };

  const [result, setResult] = React.useState([]);

  const options = [
    { value: 'javascript', label: 'Javascript' },
    { value: 'chakra', label: 'Chakra' },
    { value: 'react', label: 'React' },
    { value: 'css', label: 'CSS' },
  ];

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
        <Box position="absolute" top="20" left="4">
          <IconButton
            onClick={() => history.goBack()}
            variant="ghost"
            size="lg"
            icon={<ChevronLeftIcon />}
          />
        </Box>
        <Box height="20" />
        <Text fontSize="lg" fontWeight="bold">
          Send To
        </Text>
        <Box height="6" />
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          width="80%"
        >
          <Input placeholder="Receiver" />
          <Box height="3" />
          <Stack direction="row">
            <InputGroup width="50%">
              <InputLeftAddon children="₳" />
              <Input placeholder="Amount" />
            </InputGroup>
            <Autocomplete
              width="50%"
              placeholder="Assets"
              options={options}
              result={result}
              setResult={(options) => setResult(options)}
            />
          </Stack>
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
            colorScheme="orange"
            onClick={() => ref.current.openModal()}
            rightIcon={<Icon as={BsArrowUpRight} />}
          >
            Send
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

export default Send;
