import { Box, SimpleGrid } from '@chakra-ui/layout';
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
import React from 'react';
import { Planet } from 'react-kawaii';
import Collectible from './collectible';

const storedAssets = {};

const CollectiblesViewer = ({ assets }) => {
  const [assetsArray, setAssetsArray] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const createArray = async () => {
    if (!assets) {
      setAssetsArray(null);
      setSearch('');
      return;
    }
    setAssetsArray(null);
    await new Promise((res, rej) => setTimeout(() => res(), 10));
    const assetsArray = [];
    let i = 0;
    const filter = (asset) =>
      search
        ? asset.name.toLowerCase().includes(search.toLowerCase()) ||
          asset.policy.includes(search) ||
          asset.fingerprint.includes(search)
        : true;
    const filteredAssets = assets.filter(filter);
    while (true) {
      const sub = filteredAssets.slice(i, i + 8);
      if (sub.length <= 0) break;
      assetsArray.push(sub);
      i += 8;
    }
    setTotal(filteredAssets.length);
    setAssetsArray(assetsArray);
  };
  React.useEffect(() => {
    createArray();
  }, [assets, search]);

  React.useEffect(() => {
    return () => {
      setSearch('');
      setAssetsArray(null);
    };
  }, []);

  return (
    <>
      <Box position="relative" zIndex="0">
        {!(assets && assetsArray) ? (
          <Box
            mt="28"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner color="teal" speed="0.5s" />
          </Box>
        ) : assetsArray.length <= 0 ? (
          <Box
            mt="16"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            opacity="0.5"
          >
            <Planet size={80} mood="ko" color="#61DDBC" />
            <Box height="2" />
            <Text fontWeight="bold" color="GrayText">
              No Assets
            </Text>
          </Box>
        ) : (
          <>
            <AssetsGrid assets={assets} />
          </>
        )}
      </Box>
      <Box position="absolute" left="6" top="240px">
        <Search setSearch={setSearch} assets={assets} />
      </Box>
    </>
  );
};

const AssetsGrid = ({ assets }) => {
  return (
    <Box
      width="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <SimpleGrid columns={2} spacing={4}>
        {assets.map((asset, index) => (
          <Collectible
            key={index}
            asset={asset}
            onLoad={(fullAsset) => (storedAssets[fullAsset.unit] = fullAsset)}
            storedAssets={storedAssets}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

const Search = ({ setSearch, assets }) => {
  const [input, setInput] = React.useState('');
  const ref = React.useRef();
  React.useEffect(() => {
    if (!assets) {
      setInput('');
    }
    if (input == '') setSearch('');
  }, [input, assets]);
  return (
    <Popover
      returnFocusOnClose={false}
      matchWidth={true}
      placement="bottom-start"
      onOpen={() => setTimeout(() => ref.current.focus())}
    >
      <PopoverTrigger>
        <IconButton
          aria-label="Search assets"
          rounded="md"
          variant="ghost"
          icon={<SearchIcon boxSize="4" />}
        />
      </PopoverTrigger>
      <PopoverContent w="100%">
        <PopoverArrow />
        <PopoverBody
          p="2"
          alignItems="center"
          justifyContent="center"
          display="flex"
          textAlign="center"
        >
          <InputGroup size="sm">
            <Input
              focusBorderColor="teal.400"
              ref={ref}
              value={input}
              width={290}
              size="sm"
              // variant="filled"
              rounded="md"
              placeholder="Search policy, asset, name"
              fontSize="xs"
              onInput={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input) setSearch(input);
              }}
            />
            <InputRightElement
              children={
                <SmallCloseIcon cursor="pointer" onClick={() => setInput('')} />
              }
            />
          </InputGroup>
          <Box w="2" />
          <IconButton
            aria-label="Search assets"
            size="sm"
            rounded="md"
            color="teal.400"
            onClick={() => input && setSearch(input)}
            icon={<SearchIcon />}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default CollectiblesViewer;
