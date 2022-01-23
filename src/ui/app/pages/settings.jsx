import { Button } from '@chakra-ui/button';
import {
  Box,
  IconButton,
  Text,
  useColorMode,
  Switch as ButtonSwitch,
  Image,
  SkeletonCircle,
  Spinner,
  Checkbox,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  SmallCloseIcon,
  RepeatIcon,
  CheckIcon,
} from '@chakra-ui/icons';
import React from 'react';
import {
  getCurrentAccount,
  getWhitelisted,
  removeWhitelisted,
  resetStorage,
  setAccountAvatar,
  setAccountName,
} from '../../../api/extension';
import Account from '../components/account';
import { Route, Switch, useHistory } from 'react-router-dom';
import { NETWORK_ID, NODE } from '../../../config/config';
import ConfirmModal from '../components/confirmModal';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { MdModeEdit } from 'react-icons/md';
import AvatarLoader from '../components/avatarLoader';

const Settings = () => {
  const history = useHistory();
  const accountRef = React.useRef();
  return (
    <>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        flexDirection="column"
        position="relative"
      >
        <Account ref={accountRef} />
        <Box position="absolute" top="24" left="6">
          <IconButton
            rounded="md"
            onClick={() => history.goBack()}
            variant="ghost"
            icon={<ChevronLeftIcon boxSize="7" />}
          />
        </Box>

        <Switch>
          <Route exact path="/settings" component={Overview} />
          <Route
            exact
            path="/settings/general"
            component={() => GeneralSettings({ accountRef })}
          />
          <Route exact path="/settings/whitelisted" component={Whitelisted} />
          <Route exact path="/settings/network" component={Network} />
        </Switch>
      </Box>
    </>
  );
};

const Overview = () => {
  const history = useHistory();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        Settings
      </Text>
      <Box height="10" />
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => {
          history.push('/settings/general');
        }}
      >
        General settings
      </Button>
      <Box height="1" />
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => {
          history.push('/settings/whitelisted');
        }}
      >
        Whitelisted sites
      </Button>
      <Box height="1" />
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => {
          history.push('/settings/network');
        }}
      >
        Network
      </Button>
    </>
  );
};

const GeneralSettings = ({ accountRef }) => {
  const settings = useStoreState((state) => state.settings.settings);
  const setSettings = useStoreActions(
    (actions) => actions.settings.setSettings
  );
  const [account, setAccount] = React.useState({ name: '', avatar: '' });
  const [originalName, setOriginalName] = React.useState('');
  const { colorMode, toggleColorMode } = useColorMode();
  const ref = React.useRef();

  const nameHandler = async () => {
    await setAccountName(account.name);
    setOriginalName(account.name);
    accountRef.current.updateAccount();
  };

  const avatarHandler = async () => {
    const avatar = Math.random().toString();
    account.avatar = avatar;
    await setAccountAvatar(account.avatar);
    setAccount({ ...account });
    accountRef.current.updateAccount();
  };

  React.useEffect(() => {
    getCurrentAccount().then((account) => {
      setOriginalName(account.name);
      setAccount(account);
    });
  }, []);

  return (
    <>
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        General settings
      </Text>
      <Box height="6" />
      <InputGroup size="md" width="210px">
        <Input
          onKeyDown={(e) => {
            if (
              e.key == 'Enter' &&
              account.name.length > 0 &&
              account.name != originalName
            )
              nameHandler();
          }}
          placeholder="Change name"
          value={account.name}
          onChange={(e) => {
            account.name = e.target.value;
            setAccount({ ...account });
          }}
          pr="4.5rem"
        />
        <InputRightElement width="4.5rem">
          {account.name == originalName ? (
            <Icon mr="-4" as={MdModeEdit} />
          ) : (
            <Button
              isDisabled={account.name.length <= 0}
              h="1.75rem"
              size="sm"
              onClick={nameHandler}
            >
              Apply
            </Button>
          )}
        </InputRightElement>
      </InputGroup>
      <Box height="6" />
      <Box display="flex" alignItems="center">
        <Box width="65px" height="65px">
          <AvatarLoader forceUpdate avatar={account.avatar} width="full" />
        </Box>
        <Box w={4} />
        <IconButton
          onClick={() => {
            avatarHandler();
          }}
          rounded="md"
          size="sm"
          icon={<RepeatIcon />}
        />
      </Box>
      <Box height="6" />
      <Button
        size="sm"
        rounded="md"
        onClick={() => {
          toggleColorMode();
        }}
        rightIcon={<SunIcon ml="2" />}
      >
        {colorMode == 'dark' ? 'Light' : 'Dark'}
      </Button>

      <Box height="6" />
      <Box display="flex" alignItems="center" justifyContent="center">
        <Text>USD</Text>
        <Box width="2" />
        <ButtonSwitch
          defaultChecked={settings.currency !== 'usd'}
          onChange={(e) => {
            if (e.target.checked) {
              setSettings({ ...settings, currency: 'eur' });
            } else {
              setSettings({ ...settings, currency: 'usd' });
            }
          }}
        />
        <Box width="2" />
        <Text>EUR</Text>
      </Box>
      <Box height="10" />
      <Button
        size="xs"
        colorScheme="red"
        variant="link"
        onClick={() => ref.current.openModal()}
      >
        Reset Wallet
      </Button>
      <ConfirmModal
        info={
          <Box mb="4" fontSize="sm" width="full">
            The wallet will be reset.{' '}
            <b>Make sure you have written down your seed phrase.</b> It's the
            only way to recover your current wallet! <br />
            Type your password below, if you want to continue.
          </Box>
        }
        ref={ref}
        sign={(password) => resetStorage(password)}
        onConfirm={async (status, signedTx) => {
          if (status === true) window.close();
        }}
      />
    </>
  );
};

const Whitelisted = () => {
  const [whitelisted, setWhitelisted] = React.useState(null);
  const getData = () =>
    getWhitelisted().then((whitelisted) => {
      setWhitelisted(whitelisted);
    });
  React.useEffect(() => {
    getData();
  }, []);
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        Whitelisted sites
      </Text>
      <Box height="6" />
      {whitelisted ? (
        whitelisted.length > 0 ? (
          whitelisted.map((origin, index) => (
            <Box
              mb="2"
              key={index}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="65%"
            >
              <Image
                width="24px"
                src={`chrome://favicon/size/16@2x/${origin}`}
                fallback={<SkeletonCircle width="24px" height="24px" />}
              />
              <Text>{origin.split('//')[1]}</Text>
              <SmallCloseIcon
                cursor="pointer"
                onClick={async () => {
                  await removeWhitelisted(origin);
                  getData();
                }}
              />
            </Box>
          ))
        ) : (
          <Box
            mt="200"
            width="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="GrayText"
          >
            No whitelisted sites
          </Box>
        )
      ) : (
        <Box
          mt="200"
          width="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner color="teal" speed="0.5s" />
        </Box>
      )}

      <Box height="6" />
    </Box>
  );
};

const Network = () => {
  const settings = useStoreState((state) => state.settings.settings);
  const setSettings = useStoreActions(
    (actions) => actions.settings.setSettings
  );

  const endpointHandler = (e) => {
    setSettings({
      ...settings,
      network: {
        ...settings.network,
        [settings.network.id + 'Submit']: value,
      },
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 600);
  };

  const [value, setValue] = React.useState(
    settings.network[settings.network.id + 'Submit'] || ''
  );
  const [isEnabled, setIsEnabled] = React.useState(
    settings.network[settings.network.id + 'Submit']
  );

  const [applied, setApplied] = React.useState(false);

  React.useEffect(() => {
    setValue(settings.network[settings.network.id + 'Submit'] || '');
    setIsEnabled(Boolean(settings.network[settings.network.id + 'Submit']));
  }, [settings]);

  return (
    <>
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        Network
      </Text>
      <Box height="6" />
      <Box display="flex" alignItems="center" justifyContent="center">
        <Text>Mainnet</Text>
        <Box width="2" />
        <ButtonSwitch
          defaultChecked={settings.network.id !== NETWORK_ID.mainnet}
          onChange={(e) => {
            if (e.target.checked) {
              setSettings({
                ...settings,
                network: {
                  ...settings.network,
                  id: NETWORK_ID.testnet,
                  node: NODE.testnet,
                },
              });
            } else {
              setSettings({
                ...settings,
                network: {
                  ...settings.network,
                  id: NETWORK_ID.mainnet,
                  node: NODE.mainnet,
                },
              });
            }
          }}
        />
        <Box width="2" />
        <Text>Testnet</Text>
      </Box>
      <Box height="8" />
      <Box display="flex" alignItems="center" justifyContent="center">
        <Checkbox
          isChecked={isEnabled}
          onChange={(e) => {
            if (!e.target.checked) {
              setSettings({
                ...settings,
                network: {
                  ...settings.network,
                  [settings.network.id + 'Submit']: null,
                },
              });
              setValue('');
            }
            setIsEnabled(e.target.checked);
          }}
          size="md"
        />{' '}
        <Box width="2" /> <Text>Custom node</Text>
      </Box>
      <Box height="3" />
      <InputGroup size="md" width={'280px'}>
        <Input
          isDisabled={!isEnabled}
          fontSize={'xs'}
          value={value}
          placeholder="http://localhost:8090/api/submit/tx"
          onKeyDown={(e) => {
            if (e.key == 'Enter' && value.length > 0) {
              endpointHandler();
            }
          }}
          onChange={(e) => setValue(e.target.value)}
          pr="4.5rem"
        />
        <InputRightElement width="4.5rem">
          <Button
            isDisabled={applied || !isEnabled || value.length <= 0}
            h="1.75rem"
            size="sm"
            onClick={endpointHandler}
          >
            {applied ? <CheckIcon color={'teal.400'} /> : 'Apply'}
          </Button>
        </InputRightElement>
      </InputGroup>
    </>
  );
};

export default Settings;
