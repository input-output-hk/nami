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
import NumberFormat from 'react-number-format';

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
  const [width, setWidth] = React.useState(
    BigInt(asset.quantity) <= 1 ? 60 : 200
  );
  const [token, setToken] = React.useState(null);
  const [value, setValue] = React.useState('');

  const fetchData = async () => {
    const detailedAsset = {
      ...(await getAsset(asset.unit)),
      quantity: asset.quantity,
      input: asset.input,
    };
    if (!isMounted.current) return;
    onLoad(detailedAsset.decimals);
    setToken(detailedAsset);
  };

  React.useEffect(() => {
    setToken(null);
    fetchData();
    const initialWidth = BigInt(asset.quantity) <= 1 ? 60 : 200;
    setWidth(initialWidth);
    if (BigInt(asset.quantity) == 1) {
      setValue('1');
      onInput(1);
    } else {
      setValue(asset.input);
      onInput(asset.input);
    }
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
        {token && (
          <NumberFormat
            allowNegative={false}
            px="8"
            thousandsGroupStyle="thousand"
            decimalSeparator="."
            displayType="input"
            type="text"
            thousandSeparator={true}
            decimalScale={token.decimals}
            width={`${width}px`}
            maxWidth="152px"
            isReadOnly={BigInt(asset.quantity) <= 1}
            value={value}
            rounded="xl"
            variant="filled"
            fontSize="xs"
            placeholder="Set quantity"
            onValueChange={({ formattedValue }) => {
              setValue(formattedValue);
              onInput(formattedValue);
            }}
            isInvalid={
              token &&
              asset.input &&
              (BigInt(toUnit(asset.input, token.decimals)) >
                BigInt(asset.quantity) ||
                BigInt(toUnit(asset.input, token.decimals)) <= 0)
            }
            customInput={Input}
          />
        )}
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
