import {
  Box,
  Button,
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
  Select,
  useToast,
  Badge,
  Flex,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  SmallCloseIcon,
  RepeatIcon,
  CheckIcon,
} from '@chakra-ui/icons';
import React, { useCallback } from 'react';
import {
  getCurrentAccount,
  getCurrentAccountIndex,
  getNetwork,
  getStorage,
  getWhitelisted,
  removeWhitelisted,
  resetStorage,
  setAccountAvatar,
  setAccountName,
  setStorage,
} from '../../../api/extension';
import Account from '../components/account';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { NETWORK_ID, NODE, STORAGE } from '../../../config/config';
import ConfirmModal from '../components/confirmModal';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { MdModeEdit } from 'react-icons/md';
import AvatarLoader from '../components/avatarLoader';
import { ChangePasswordModal } from '../components/changePasswordModal';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';
import { LegalSettings } from '../../../features/settings/legal/LegalSettings';
import { usePostHog } from 'posthog-js/react';
import { useFeatureFlagsContext } from '../../../features/feature-flags/provider';
import { enableMigration } from '../../../api/migration-tool/cross-extension-messaging/nami-migration-client.extension';
import {
  MigrationState,
  MIGRATION_KEY,
} from '../../../api/migration-tool/migrator/migration-state.data';
import { storage } from 'webextension-polyfill';

const Settings = () => {
  const navigate = useNavigate();
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
            onClick={() => navigate(-1)}
            variant="ghost"
            icon={<ChevronLeftIcon boxSize="7" />}
          />
        </Box>

        <Routes>
          <Route path="*" element={<Overview />} />
          <Route
            path="general"
            element={<GeneralSettings accountRef={accountRef} />}
          />
          <Route path="whitelisted" element={<Whitelisted />} />
          <Route path="network" element={<Network />} />
          <Route path="legal" element={<LegalSettings />} />
          <Route path="beta-partner" element={<BetaPartner />} />
        </Routes>
      </Box>
    </>
  );
};

const Overview = () => {
  const capture = useCaptureEvent();
  const navigate = useNavigate();
  const { earlyAccessFeatures, featureFlags } = useFeatureFlagsContext();
  return (
    <>
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        Settings
      </Text>
      <Box height="10" />
      {earlyAccessFeatures?.find((f) => f.name === 'beta-partner') &&
        !featureFlags?.['is-migration-active'] && (
          <Button
            justifyContent="space-between"
            variant="ghost"
            width="65%"
            rightIcon={<ChevronRightIcon />}
            onClick={() => {
              navigate('beta-partner');
            }}
          >
            Become a Beta partner
          </Button>
        )}
      {earlyAccessFeatures?.find((f) => f.name === 'beta-partner') &&
        featureFlags?.['is-migration-active']?.dismissable && (
          <Button
            justifyContent="space-between"
            variant="ghost"
            width="65%"
            rightIcon={<ChevronRightIcon />}
            onClick={async () => {
              await enableMigration();
            }}
          >
            <Flex
              flex={1}
              justifyContent={'space-between'}
              alignContent={'center'}
              flexDirection={'row'}
            >
              <Text>Upgrade your wallet</Text>
              <Badge
                borderRadius={16}
                fontWeight={400}
                fontSize={12}
                alignContent={'center'}
                colorScheme="teal"
                variant={'subtle'}
              >
                Beta
              </Badge>
            </Flex>
          </Button>
        )}
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => {
          navigate('general');
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
          capture(Events.SettingsAuthorizedDappsClick);
          navigate('whitelisted');
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
          navigate('network');
        }}
      >
        Network
      </Button>
      <Box height="1" />
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => {
          navigate('legal');
        }}
      >
        Legal
      </Button>
    </>
  );
};

const GeneralSettings = ({ accountRef }) => {
  const capture = useCaptureEvent();
  const navigate = useNavigate();
  const settings = useStoreState((state) => state.settings.settings);
  const setSettings = useStoreActions(
    (actions) => actions.settings.setSettings
  );
  const [refreshed, setRefreshed] = React.useState(false);
  const [account, setAccount] = React.useState({ name: '', avatar: '' });
  const [originalName, setOriginalName] = React.useState('');
  const { colorMode, toggleColorMode } = useColorMode();
  const ref = React.useRef();
  const changePasswordRef = React.useRef();

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
    capture(Events.SettingsChangeAvatarClick);
  };

  const refreshHandler = async () => {
    setRefreshed(true);

    const currentIndex = await getCurrentAccountIndex();
    const accounts = await getStorage(STORAGE.accounts);
    const currentAccount = accounts[currentIndex];
    const network = await getNetwork();
    currentAccount[network.id].forceUpdate = true;

    await setStorage({
      [STORAGE.accounts]: {
        ...accounts,
      },
    });

    navigate('/wallet');
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
          if (colorMode === 'dark') {
            capture(Events.SettingsThemeLightModeClick);
          } else {
            capture(Events.SettingsThemeDarkModeClick);
          }
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
      <Button disabled={refreshed} size="sm" onClick={refreshHandler}>
        Refresh Balance
      </Button>
      <Box height="5" />
      <Button
        colorScheme="orange"
        size="sm"
        onClick={() => {
          capture(Events.SettingsChangePasswordClick);
          changePasswordRef.current.openModal();
        }}
      >
        Change Password
      </Button>
      <Box height="10" />
      <Button
        size="xs"
        colorScheme="red"
        variant="link"
        onClick={() => {
          capture(Events.SettingsRemoveWalletClick);
          ref.current.openModal();
        }}
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
        onCloseBtn={() => {
          capture(Events.SettingsHoldUpBackClick);
        }}
        sign={(password) => {
          capture(Events.SettingsHoldUpRemoveWalletClick);
          return resetStorage(password);
        }}
        onConfirm={async (status, signedTx) => {
          if (status === true) window.close();
        }}
      />
      <ChangePasswordModal ref={changePasswordRef} />
    </>
  );
};

const Whitelisted = () => {
  const capture = useCaptureEvent();
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
                src={`chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${origin}&size=32`}
                fallback={<SkeletonCircle width="24px" height="24px" />}
              />
              <Text>{origin.split('//')[1]}</Text>
              <SmallCloseIcon
                cursor="pointer"
                onClick={async () => {
                  capture(Events.SettingsAuthorizedDappsTrashBinIconClick);
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
  const capture = useCaptureEvent();
  const settings = useStoreState((state) => state.settings.settings);
  const setSettings = useStoreActions(
    (actions) => actions.settings.setSettings
  );

  const endpointHandler = (e) => {
    capture(Events.SettingsNetworkCustomNodeClick);
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
        <Select
          defaultValue={settings.network.id}
          onChange={(e) => {
            switch (e.target.value) {
              case NETWORK_ID.mainnet:
                capture(Events.SettingsNetworkMainnetClick);
                break;
              case NETWORK_ID.preprod:
                capture(Events.SettingsNetworkPreprodClick);
                break;
              case NETWORK_ID.preview:
                capture(Events.SettingsNetworkPreviewClick);
                break;
              default:
                break;
            }

            const id = e.target.value;

            setSettings({
              ...settings,
              network: {
                ...settings.network,
                id: NETWORK_ID[id],
                node: NODE[id],
              },
            });
          }}
        >
          <option value={NETWORK_ID.mainnet}>Mainnet</option>
          <option value={NETWORK_ID.preprod}>Preprod</option>
          <option value={NETWORK_ID.preview}>Preview</option>
        </Select>
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

const BetaPartner = () => {
  const posthog = usePostHog();
  const navigate = useNavigate();
  const toast = useToast();

  const enrollInBetaPartnerMigationProgram = useCallback(async () => {
    await storage.local.set({ [MIGRATION_KEY]: MigrationState.Dormant });
    posthog.updateEarlyAccessFeatureEnrollment('is-migration-active', true);
    toast({
      status: 'success',
      title: 'joined the beta program',
    });
    navigate(-1);
  }, [posthog, toast, navigate]);

  return (
    <>
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        Become a Beta partner
      </Text>
      <Box height="6" />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="start"
        w="calc(100% - 120px)"
        flex={1}
        paddingBottom="20px"
      >
        <Text fontSize="medium">
          Be one of the first users to try out an upgrade to Nami mode within
          Lace.
          <br />
          <br />
          Choose this option if you're an early adopter or community advocate.
        </Text>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap="14px"
        paddingBottom="40px"
        w="calc(100% - 120px)"
      >
        <Button colorScheme="teal" onClick={enrollInBetaPartnerMigationProgram}>
          Become a Beta partner
        </Button>
        <Button colorScheme="orange" onClick={() => navigate(-1)}>
          Maybe later
        </Button>
      </Box>
    </>
  );
};

export default Settings;
