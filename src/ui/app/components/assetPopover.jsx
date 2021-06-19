import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Box,
  Portal,
  Image,
  Spinner,
  Avatar,
  Text,
} from '@chakra-ui/react';
import MiddleEllipsis from 'react-middle-ellipsis';
import React from 'react';
import Copy from './copy';

const AssetPopover = ({ asset, gutter, ...props }) => {
  return (
    <Popover matchWidth={true} placement="top-start" gutter={gutter}>
      <PopoverTrigger>
        <Box>{props.children}</Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="98%">
          <PopoverArrow ml="4px" />
          <PopoverCloseButton />
          <PopoverBody
            p="-2"
            alignItems="center"
            justifyContent="center"
            display="flex"
            flexDirection="column"
            textAlign="center"
          >
            {asset ? (
              <Box
                width={330}
                mt="8"
                mb="3"
                alignItems="center"
                justifyContent="center"
                display="flex"
                flexDirection="column"
              >
                <Image
                  rounded="sm"
                  height="140px"
                  maxWidth="280px"
                  src={asset.image}
                  fallback={<Avatar size="xl" name={asset.name} />}
                />
                <Box h="4" />
                <Copy
                  label="Copied name"
                  copy={asset.displayName || asset.name}
                >
                  <Text
                    fontWeight="bold"
                    color="GrayText"
                    fontSize="sm"
                    lineHeight="1.1"
                    maxWidth="280px"
                    isTruncated={true}
                  >
                    {asset.displayName || asset.name}
                  </Text>
                </Copy>
                <Box h="2" />
                <Text fontWeight="bold">{asset.quantity}</Text>
                <Box h="2" />
                <Copy label="Copied policy" copy={asset.policy}>
                  <Box
                    whiteSpace="nowrap"
                    fontSize="xx-small"
                    fontWeight="thin"
                  >
                    <MiddleEllipsis>
                      <span>
                        <b>Policy</b>: {asset.policy}
                      </span>
                    </MiddleEllipsis>
                  </Box>
                </Copy>
                <Box h="1" />
                <Copy label="Copied asset" copy={asset.fingerprint}>
                  <Box
                    whiteSpace="nowrap"
                    fontSize="xx-small"
                    fontWeight="thin"
                  >
                    <MiddleEllipsis>
                      <span>
                        <b>Asset</b>: {asset.fingerprint}
                      </span>
                    </MiddleEllipsis>
                  </Box>
                </Copy>
                {/* <Text lineHeight="1.1">Policy: {asset.policy}</Text>
                <Text lineHeight="1.1">Asset: {asset.fingerprint}</Text> */}
              </Box>
            ) : (
              <Spinner color="teal" speed="0.5s" />
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default AssetPopover;
