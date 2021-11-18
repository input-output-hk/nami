import { SmallCloseIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SkeletonCircle,
} from '@chakra-ui/react';
import React from 'react';
import { getAsset, toUnit } from '../../../api/extension';

import AssetPopover from './assetPopover';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const AssetBadge = ({ asset, onRemove, onInput, onLoad }) => {
  const isMounted = useIsMounted();
  const [initialWidth, setInitialWidth] = React.useState(
    BigInt(asset.quantity) <= 1 ? 60 : 85
  );
  const [width, setWidth] = React.useState(initialWidth);
  const [token, setToken] = React.useState(null);

  const fetchData = async () => {
    const detailedAsset = {
      ...(await getAsset(asset.unit)),
      quantity: asset.quantity,
    };
    if (!isMounted.current) return;
    onLoad(detailedAsset.decimals);
    setToken(detailedAsset);
  };

  React.useEffect(() => {
    fetchData();
    const initialWidth = BigInt(asset.quantity) <= 1 ? 60 : 85;
    setInitialWidth(initialWidth);
    setWidth(initialWidth);
    if (BigInt(asset.quantity) <= 1) onInput(asset.quantity);
    else onInput();
  }, [asset]);
  return (
    <Box m="0.5">
      <InputGroup size="sm">
        <InputLeftElement
          rounded="lg"
          children={
            <Box
              userSelect="none"
              width="6"
              height="6"
              rounded="full"
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {!token ? (
                <SkeletonCircle size="5" />
              ) : (
                <AssetPopover asset={token}>
                  <Button
                    style={{
                      all: 'revert',
                      margin: 0,
                      padding: 0,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      width="full"
                      rounded="sm"
                      src={token.image}
                      fallback={
                        !token.image ? (
                          <Avatar size="xs" name={token.name} />
                        ) : (
                          <Fallback name={token.name} />
                        )
                      }
                    />
                  </Button>
                </AssetPopover>
              )}
            </Box>
          }
        />
        <Input
          width={`${width}px`}
          maxWidth="130px"
          isReadOnly={BigInt(asset.quantity) <= 1}
          value={asset.input || ''}
          rounded="xl"
          variant="filled"
          fontSize="xs"
          placeholder="Qty"
          onInput={(e) => {
            const val = e.target.value;
            if (
              token.decimals == 0 &&
              !e.target.value.match(/^\d*[0-9]\d*$/) &&
              e.target.value
            )
              return;
            if (!val.match(/^\d*[0-9,.]\d*$/) && val) return;
            if (val.split('.')[1] && val.split('.')[1].length > token.decimals)
              return;
            setWidth(initialWidth + val.length * 4);
            onInput(val);
          }}
          isInvalid={
            token &&
            asset.input &&
            (BigInt(toUnit(asset.input, token.decimals)) >
              BigInt(asset.quantity) ||
              BigInt(toUnit(asset.input, token.decimals)) <= 0)
          }
        />
        <InputRightElement
          rounded="lg"
          children={
            <SmallCloseIcon cursor="pointer" onClick={() => onRemove()} />
          }
        />
      </InputGroup>
    </Box>
  );
};

const Fallback = ({ name }) => {
  const [timedOut, setTimedOut] = React.useState(false);
  const isMounted = useIsMounted();
  React.useEffect(() => {
    setTimeout(() => isMounted.current && setTimedOut(true), 30000);
  }, []);
  if (timedOut) return <Avatar size="xs" name={name} />;
  return <SkeletonCircle size="5" />;
};

export default AssetBadge;
