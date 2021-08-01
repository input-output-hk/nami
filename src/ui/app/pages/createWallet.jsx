import React from 'react';
import {
  createWallet,
  mnemonicFromObject,
  mnemonicToObject,
} from '../../../api/extension';
import { Button } from '@chakra-ui/button';
import { Route, Switch, useHistory } from 'react-router-dom';
import { Image } from '@chakra-ui/react';
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
} from '@chakra-ui/input';
import { Box, Spacer, Stack, Text } from '@chakra-ui/layout';
import { generateMnemonic, getDefaultWordlist, wordlists } from 'bip39';
import { CloseButton } from '@chakra-ui/close-button';
import { Checkbox } from '@chakra-ui/checkbox';
import { ChevronRightIcon } from '@chakra-ui/icons';

import Logo from '../../../assets/img/logo.svg';

const CreateWallet = ({ data }) => {
  const history = useHistory();

  return (
    <Box
      display="flex"
      alignItems="center"
      // justifyContent="center"
      flexDirection="column"
      height="100vh"
      position="relative"
    >
      <Box position="absolute" top="6" left="6">
        <Image src={Logo} width="30px" draggable={false} />
      </Box>
      <Box position="absolute" top="6" right="6">
        <CloseButton size="md" onClick={() => history.push('/welcome')} />
      </Box>
      <Switch>
        <Route exact path="/createWallet/generate" component={GenerateSeed} />
        <Route exact path="/createWallet/verify" component={VerifySeed} />
        <Route exact path="/createWallet/account" component={MakeAccount} />
        <Route exact path="/createWallet/import" component={ImportSeed} />
      </Switch>
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
  React.useEffect(() => {
    generate();
  }, []);

  return (
    <Box marginTop="10">
      <Text textAlign="center" fontWeight="bold" fontSize="xl">
        Seed Phrase
      </Text>
      <Spacer height="4" />
      <Stack
        spacing={4}
        direction="row"
        alignItems="center"
        justifyContent="center"
      >
        {[0, 1].map((colIndex) => (
          <Box key={colIndex} width={120}>
            {[...Array(12)].map((_, rowIndex) => {
              const index = colIndex * 12 + rowIndex + 1;
              return (
                <InputGroup key={index} size="xs" marginBottom={2}>
                  {!colIndex && (
                    <InputLeftAddon
                      // color="white"
                      fontWeight="bold"
                      rounded="full"
                      children={`${index}`}
                      // background="teal.400"
                    />
                  )}
                  <Input
                    isReadOnly={true}
                    value={mnemonic ? mnemonic[index] : '...'}
                    textAlign="center"
                    variant="filled"
                    fontWeight="bold"
                    rounded="full"
                    placeholder={`Word ${index}`}
                  ></Input>
                  {colIndex && (
                    <InputRightAddon
                      // color="white"
                      fontWeight="bold"
                      rounded="full"
                      children={`${index}`}
                      // background="teal.400"
                    />
                  )}
                </InputGroup>
              );
            })}
          </Box>
        ))}
      </Stack>
      <Spacer height="4" />
      <Stack alignItems="center" direction="column">
        <Stack direction="row" width="64" spacing="6">
          <Checkbox onChange={(e) => setChecked(e.target.checked)} size="lg" />
          <Text wordBreak="break-word" fontWeight="bold" fontSize="xs">
            I've written down the seed phrase and stored it in a secure place.
          </Text>
        </Stack>
        <Spacer height="2" />
        <Button
          isDisabled={!checked}
          rightIcon={<ChevronRightIcon />}
          onClick={() =>
            history.push({ pathname: '/createWallet/verify', mnemonic })
          }
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
    for (let index = 1; index <= 24; index++) {
      if (mnemonic[index] !== input[index]) {
        if (allValid === true) setAllValid(false);
        return false;
      }
    }
    setAllValid(true);
  };

  React.useEffect(() => {
    verifyAll();
  }, [input]);

  return (
    <Box marginTop="10">
      <Text textAlign="center" fontWeight="bold" fontSize="xl">
        Verify Seed Phrase
      </Text>
      <Spacer height="2" />
      <Text fontSize="xs" textAlign="center">
        Enter the seed phrase you've just stored.
      </Text>
      <Spacer height="4" />
      <Stack spacing={4} direction="row">
        {[0, 1].map((colIndex) => (
          <Box key={colIndex} width={120}>
            {[...Array(12)].map((_, rowIndex) => {
              const index = colIndex * 12 + rowIndex + 1;
              return (
                <InputGroup key={index} size="xs" marginBottom={2}>
                  {!colIndex && (
                    <InputLeftAddon
                      fontWeight="bold"
                      rounded="full"
                      children={`${index}`}
                    />
                  )}
                  <Input
                    isInvalid={input[index] && input[index] !== mnemonic[index]}
                    ref={(el) => (refs.current[index] = el)}
                    onChange={(e) => {
                      setInput((i) => ({
                        ...i,
                        [index]: e.target.value,
                      }));
                      const next = refs.current[index + 1];
                      if (next && e.target.value === mnemonic[index]) {
                        next.focus();
                      } else if (!next && e.target.value === mnemonic[index])
                        refs.current[index].blur();
                    }}
                    textAlign="center"
                    fontWeight="bold"
                    rounded="full"
                    placeholder={`Word ${index}`}
                  ></Input>
                  {colIndex && (
                    <InputRightAddon
                      fontWeight="bold"
                      rounded="full"
                      children={`${index}`}
                    />
                  )}
                </InputGroup>
              );
            })}
          </Box>
        ))}
      </Stack>
      <Spacer height="6" />
      <Stack alignItems="center" direction="column">
        <Button
          isDisabled={!allValid}
          rightIcon={<ChevronRightIcon />}
          onClick={() =>
            history.push({ pathname: '/createWallet/account', mnemonic })
          }
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
    for (let index = 1; index <= seedLength; index++) {
      if (!words.includes(input[index])) {
        if (allValid === true) setAllValid(false);
        return false;
      }
    }
    setAllValid(true);
  };

  React.useEffect(() => {
    verifyAll();
  }, [input]);

  return (
    <Box marginTop="10">
      <Text textAlign="center" fontWeight="bold" fontSize="xl">
        Import Seed Phrase
      </Text>
      <Spacer height="2" />
      <Text fontSize="xs" textAlign="center">
        Enter a {seedLength}-word seed phrase.
      </Text>
      <Spacer height="4" />
      <Stack spacing={4} direction="row">
        {[0, 1].map((colIndex) => (
          <Box key={colIndex} width={120}>
            {[...Array(12)].map((_, rowIndex) => {
              const index = colIndex * 12 + rowIndex + 1;
              if (index > seedLength) return;
              return (
                <InputGroup key={index} size="xs" marginBottom={2}>
                  {!colIndex && (
                    <InputLeftAddon
                      fontWeight="bold"
                      rounded="full"
                      children={`${index}`}
                    />
                  )}
                  <Input
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
                  {colIndex && (
                    <InputRightAddon
                      fontWeight="bold"
                      rounded="full"
                      children={`${index}`}
                    />
                  )}
                </InputGroup>
              );
            })}
          </Box>
        ))}
      </Stack>
      <Spacer height="6" />
      <Stack alignItems="center" direction="column">
        <Button
          isDisabled={!allValid}
          rightIcon={<ChevronRightIcon />}
          onClick={() =>
            history.push({ pathname: '/createWallet/account', mnemonic: input })
          }
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

const MakeAccount = (props) => {
  const [state, setState] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();
  const mnemonic = history.location.mnemonic;

  return (
    <Box
      marginTop="40"
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
          <Text color="red.300">
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
          <Text color="red.300">Password doesn't match</Text>
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
            setLoading(false);
            history.push('/wallet');
          }}
        >
          Create
        </Button>
      </Box>
    </Box>
  );
};

export default CreateWallet;
