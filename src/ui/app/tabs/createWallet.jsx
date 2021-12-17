/**
 * hw.jsx is the entry point for the harware wallet extension tab
 */

import React from 'react';
import {
  createWallet,
  mnemonicFromObject,
  mnemonicToObject,
} from '../../../api/extension';
import { Button } from '@chakra-ui/button';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from 'react-router-dom';
import { Icon, Image, useColorModeValue } from '@chakra-ui/react';
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
} from '@chakra-ui/input';
import { Box, Spacer, Stack, Text } from '@chakra-ui/layout';
import {
  generateMnemonic,
  getDefaultWordlist,
  validateMnemonic,
  wordlists,
} from 'bip39';
import { CloseButton } from '@chakra-ui/close-button';
import { Checkbox } from '@chakra-ui/checkbox';
import { ChevronRightIcon, DownloadIcon } from '@chakra-ui/icons';
import { render } from 'react-dom';
import Main from '../../index';
import { TAB } from '../../../config/config';
import { Planet } from 'react-kawaii';
import { useDropzone } from 'react-dropzone';

import LogoOriginal from '../../../assets/img/logo.svg';
import LogoWhite from '../../../assets/img/logoWhite.svg';
import { useStoreActions } from 'easy-peasy';
import { BsFileEarmark } from 'react-icons/bs';

const App = () => {
  const Logo = useColorModeValue(LogoOriginal, LogoWhite);
  const backgroundColor = useColorModeValue('gray.200', 'inherit');
  const cardColor = useColorModeValue('white', 'gray.900');
  const history = useHistory();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const length = params.get('length');
    if (type === 'import')
      history.push({
        pathname: '/import',
        seedLength: parseInt(length),
      });
    else history.push('/generate');
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="full"
      height="100vh"
      position="relative"
      background={backgroundColor}
    >
      {/* Logo */}
      <Box position="absolute" left="40px" top="40px">
        <Image draggable={false} src={Logo} width="36px" />
      </Box>
      <Box
        rounded="2xl"
        shadow="md"
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
        width="90%"
        maxWidth="460px"
        maxHeight="650px"
        height="80vh"
        p={10}
        background={cardColor}
        fontSize="sm"
      >
        <Switch>
          <Route exact path="/generate" component={GenerateSeed} />
          <Route exact path="/verify" component={VerifySeed} />
          <Route exact path="/account" component={MakeAccount} />
          <Route exact path="/import" component={ImportSeed} />
        </Switch>
      </Box>
    </Box>
  );
};

const GenerateSeed = (props) => {
  const history = useHistory();
  const [mnemonic, setMnemonic] = React.useState({});
  const generate = () => {
    const mnemonic = generateMnemonic(256);
    const mnemonicMap = mnemonicToObject(mnemonic);
    setMnemonic(mnemonicMap);
  };
  const [checked, setChecked] = React.useState(false);

  const download = (content, fileName, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  React.useEffect(() => {
    generate();
  }, []);

  return (
    <Box>
      <Text textAlign="center" fontWeight="bold" fontSize="xl">
        Seed Phrase
      </Text>
      <Spacer height="4" />
      <Stack
        spacing={3}
        direction="row"
        alignItems="center"
        justifyContent="center"
      >
        {[0, 1].map((colIndex) => (
          <Box key={colIndex} width={140}>
            {[...Array(12)].map((_, rowIndex) => {
              const index = colIndex * 12 + rowIndex + 1;
              return (
                <Box
                  key={index}
                  marginBottom={2}
                  display="flex"
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  {!Boolean(colIndex) && (
                    <Box
                      mr={2}
                      width={5}
                      height={5}
                      fontSize={'xs'}
                      fontWeight="bold"
                      rounded="full"
                      background={'teal'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      color={'white'}
                    >
                      {index}
                    </Box>
                  )}
                  <Input
                    width={110}
                    size={'xs'}
                    isReadOnly={true}
                    value={mnemonic ? mnemonic[index] : '...'}
                    textAlign="center"
                    variant="filled"
                    fontWeight="bold"
                    rounded="full"
                    placeholder={`Word ${index}`}
                  ></Input>
                  {Boolean(colIndex) && (
                    <Box
                      ml={2}
                      width={5}
                      height={5}
                      fontSize={'xs'}
                      fontWeight="bold"
                      rounded="full"
                      background={'teal'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      color={'white'}
                    >
                      {index}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Stack>
      {/* <Box h="3" />
      <Box display="flex" justifyContent="center">
        {' '}
        <Button
          onClick={() =>
            download(
              JSON.stringify({ wallet: 'Nami', seedphrase: mnemonic }),
              'nami-seedphrase.json',
              'text/plain'
            )
          }
          fontWeight="normal"
          size="xs"
          variant="ghost"
          rightIcon={<DownloadIcon />}
        >
          Download
        </Button>
      </Box> */}

      <Box height={3} />
      <Stack alignItems="center" direction="column">
        <Stack direction="row" width="64" spacing="6">
          <Checkbox onChange={(e) => setChecked(e.target.checked)} size="lg" />
          <Text wordBreak="break-word" fontWeight="bold" fontSize="xs">
            I've stored the seed phrase in a secure place.
          </Text>
        </Stack>
        <Box height={4} />
        <Button
          isDisabled={!checked}
          rightIcon={<ChevronRightIcon />}
          onClick={() => history.push({ pathname: '/verify', mnemonic })}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

const VerifySeed = () => {
  const history = useHistory();
  const mnemonic = history.location.mnemonic;
  const [input, setInput] = React.useState({});
  const [allValid, setAllValid] = React.useState(false);
  const refs = React.useRef([]);

  const verifyAll = () => {
    if (
      input[5] == mnemonic[5] &&
      input[10] == mnemonic[10] &&
      input[15] == mnemonic[15] &&
      input[20] == mnemonic[20]
    )
      setAllValid(true);
    else setAllValid(false);
  };

  React.useEffect(() => {
    verifyAll();
  }, [input]);

  return (
    <Box>
      <Text textAlign="center" fontWeight="bold" fontSize="xl">
        Verify Seed Phrase
      </Text>
      <Spacer height="2" />
      <Text fontSize="xs" textAlign="center">
        Enter the seed phrase you've just stored.
      </Text>
      <Spacer height="6" />
      <Stack spacing={3} direction="row">
        {[0, 1].map((colIndex) => (
          <Box key={colIndex} width={140}>
            {[...Array(12)].map((_, rowIndex) => {
              const index = colIndex * 12 + rowIndex + 1;
              return (
                <Box
                  key={index}
                  marginBottom={2}
                  display="flex"
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  {!Boolean(colIndex) && (
                    <Box
                      mr={2}
                      width={5}
                      height={5}
                      fontSize={'xs'}
                      fontWeight="bold"
                      rounded="full"
                      background={'teal'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      color={'white'}
                    >
                      {index}
                    </Box>
                  )}
                  <Input
                    variant={index % 5 !== 0 ? 'filled' : 'outline'}
                    defaultValue={index % 5 !== 0 ? mnemonic[index] : ''}
                    isReadOnly={index % 5 !== 0}
                    width={110}
                    size={'xs'}
                    isInvalid={input[index] && input[index] !== mnemonic[index]}
                    ref={(el) => (refs.current[index] = el)}
                    onChange={(e) => {
                      setInput((i) => ({
                        ...i,
                        [index]: e.target.value,
                      }));
                      const next = refs.current[index + 1];
                      if (next && e.target.value === mnemonic[index]) {
                        refs.current[index].blur();
                      }
                    }}
                    textAlign="center"
                    fontWeight="bold"
                    rounded="full"
                    placeholder={`Word ${index}`}
                  ></Input>
                  {Boolean(colIndex) && (
                    <Box
                      ml={2}
                      width={5}
                      height={5}
                      fontSize={'xs'}
                      fontWeight="bold"
                      rounded="full"
                      background={'teal'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      color={'white'}
                    >
                      {index}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Stack>
      <Spacer height="6" />
      <Stack alignItems="center" justifyContent="center" direction="row">
        <Button
          fontWeight="medium"
          color="gray.400"
          variant="ghost"
          onClick={() => history.push({ pathname: '/account', mnemonic })}
        >
          Skip
        </Button>
        <Button
          ml="3"
          isDisabled={!allValid}
          rightIcon={<ChevronRightIcon />}
          onClick={() => history.push({ pathname: '/account', mnemonic })}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

const ImportSeed = () => {
  const history = useHistory();
  const seedLength = history.location.seedLength;
  const [input, setInput] = React.useState({});
  const [allValid, setAllValid] = React.useState(false);
  const refs = React.useRef([]);
  const words = wordlists[getDefaultWordlist()];

  const verifyAll = () => {
    if (
      Object.keys(input).length == seedLength &&
      validateMnemonic(mnemonicFromObject(input))
    )
      setAllValid(true);
    else setAllValid(false);
  };

  React.useEffect(() => {
    verifyAll();
  }, [input]);

  return (
    <Box>
      <Text textAlign="center" fontWeight="bold" fontSize="xl">
        Import Seed Phrase
      </Text>
      <Spacer height="2" />
      <Text fontSize="xs" textAlign="center">
        Enter a {seedLength}-word seed phrase.
      </Text>
      <Spacer height="4" />
      <Stack spacing={3} direction="row">
        {[0, 1].map((colIndex) => (
          <Box key={colIndex} width={140}>
            {[...Array(12)].map((_, rowIndex) => {
              const index = colIndex * 12 + rowIndex + 1;
              if (index > seedLength) return;
              return (
                <Box
                  key={index}
                  marginBottom={2}
                  display="flex"
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  {!Boolean(colIndex) && (
                    <Box
                      mr={2}
                      width={5}
                      height={5}
                      fontSize={'xs'}
                      fontWeight="bold"
                      rounded="full"
                      background={'teal'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      color={'white'}
                    >
                      {index}
                    </Box>
                  )}
                  <Input
                    variant={'filled'}
                    width={110}
                    size={'xs'}
                    isInvalid={input[index] && !words.includes(input[index])}
                    ref={(el) => (refs.current[index] = el)}
                    onChange={(e) => {
                      setInput((i) => ({
                        ...i,
                        [index]: e.target.value,
                      }));
                    }}
                    textAlign="center"
                    fontWeight="bold"
                    rounded="full"
                    placeholder={`Word ${index}`}
                  ></Input>
                  {Boolean(colIndex) && (
                    <Box
                      ml={2}
                      width={5}
                      height={5}
                      fontSize={'xs'}
                      fontWeight="bold"
                      rounded="full"
                      background={'teal'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      color={'white'}
                    >
                      {index}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Stack>
      <Spacer height="1" />
      {seedLength == 24 &&
        false && ( // TODO: give user more information because of security reasons
          <>
            <Box textAlign="center" fontSize="xs">
              or
            </Box>
            <Spacer height="2" />
            <SeedDrop
              onLoad={(seedphrase) =>
                history.push({ pathname: '/account', mnemonic: seedphrase })
              }
            />
          </>
        )}
      <Spacer height="5" />
      <Stack alignItems="center" direction="column">
        <Button
          isDisabled={!allValid}
          rightIcon={<ChevronRightIcon />}
          onClick={() =>
            history.push({ pathname: '/account', mnemonic: input })
          }
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

const SeedDrop = ({ onLoad, ...props }) => {
  const [isValid, setIsValid] = React.useState(true);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: 'application/json',
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const fileUrl = URL.createObjectURL(file);
        fileToJson(fileUrl);
      });
    },
  });

  const fileToJson = async (fileUrl) => {
    const json = await fetch(fileUrl).then((r) => r.json());
    try {
      const mnemonic = mnemonicFromObject(json.seedphrase);
      if (!validateMnemonic(mnemonic)) throw new Error('Invalid mnemonic');
      onLoad(json.seedphrase);
    } catch (e) {
      setIsValid(false);
      setTimeout(() => setIsValid(true), 1000);
    }
  };

  return (
    <Box {...props} display="flex" alignItems="center" justifyContent="center">
      <Box
        transition="0.3s"
        border="1px dashed"
        background={
          !isValid
            ? 'red.300'
            : isDragAccept
            ? 'teal'
            : isDragReject
            ? 'red.300'
            : 'transparent'
        }
        borderColor={isDragAccept ? 'teal' : isDragReject ? 'red.300' : 'gray'}
        rounded="xl"
      >
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <Box
            width="200px"
            height="30px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <Box
              color={
                !isValid
                  ? 'white'
                  : isDragAccept
                  ? 'white'
                  : isDragReject
                  ? 'white'
                  : 'GrayText'
              }
            >
              {' '}
              {isDragReject || !isValid ? (
                'Invalid file'
              ) : (
                <span>
                  From Nami file <Icon ml="2" as={BsFileEarmark} />
                </span>
              )}
            </Box>
          </Box>
        </div>
      </Box>
    </Box>
  );
};

const MakeAccount = (props) => {
  const [state, setState] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();
  const mnemonic = history.location.mnemonic;
  const [isDone, setIsDone] = React.useState(false);
  const setRoute = useStoreActions(
    (actions) => actions.globalModel.routeStore.setRoute
  );

  return isDone ? (
    <SuccessAndClose />
  ) : (
    <Box
      textAlign="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      <Box width="70%">
        <Text fontWeight="bold" fontSize="xl">
          Create Account
        </Text>
        <Spacer height="10" />
        <Input
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          placeholder="Enter account name"
        ></Input>
        <Spacer height="6" />

        <InputGroup size="md" width="100%">
          <Input
            isInvalid={state.regularPassword === false}
            pr="4.5rem"
            type={state.show ? 'text' : 'password'}
            onChange={(e) =>
              setState((s) => ({ ...s, password: e.target.value }))
            }
            onBlur={(e) =>
              e.target.value &&
              setState((s) => ({
                ...s,
                regularPassword: e.target.value.length >= 8,
              }))
            }
            placeholder="Enter password"
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => setState((s) => ({ ...s, show: !s.show }))}
            >
              {state.show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
        {state.regularPassword === false && (
          <Text fontSize={'xs'} color="red.300">
            Password must be at least 8 characters long
          </Text>
        )}
        <Spacer height="2" />

        <InputGroup size="md">
          <Input
            isInvalid={state.matchingPassword === false}
            pr="4.5rem"
            onChange={(e) =>
              setState((s) => ({ ...s, passwordConfirm: e.target.value }))
            }
            onBlur={(e) =>
              e.target.value &&
              setState((s) => ({
                ...s,
                matchingPassword: e.target.value === s.password,
              }))
            }
            type={state.show ? 'text' : 'password'}
            placeholder="Confirm password"
          />
          <InputRightElement _disabled={true} width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => setState((s) => ({ ...s, show: !s.show }))}
            >
              {state.show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
        {state.matchingPassword === false && (
          <Text fontSize={'xs'} color="red.300">
            Password doesn't match
          </Text>
        )}
        <Spacer height="8" />
        <Button
          isDisabled={
            !state.password ||
            !state.password.length >= 8 ||
            state.password !== state.passwordConfirm ||
            !state.name
          }
          isLoading={loading}
          colorScheme="teal"
          loadingText="Creating"
          rightIcon={<ChevronRightIcon />}
          onClick={async () => {
            setLoading(true);
            await createWallet(
              state.name,
              mnemonicFromObject(mnemonic),
              state.password
            );
            setRoute('/wallet');
            setLoading(false);
            setIsDone(true);
          }}
        >
          Create
        </Button>
      </Box>
    </Box>
  );
};

const SuccessAndClose = () => {
  return (
    <>
      <Text
        mt={10}
        fontSize="x-large"
        fontWeight="semibold"
        width={200}
        textAlign="center"
      >
        Successfully created wallet!
      </Text>
      <Box h={6} />
      <Planet mood="blissful" size={150} color="#61DDBC" />
      <Box h={10} />
      <Text width="300px">
        You can now close this tab and continue with the extension.
      </Text>
      <Button mt="auto" onClick={async () => window.close()}>
        Close
      </Button>
    </>
  );
};

render(
  <Main>
    <Router>
      <App />
    </Router>
  </Main>,
  window.document.querySelector(`#${TAB.createWallet}`)
);

if (module.hot) module.hot.accept();
