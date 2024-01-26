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
  Avatar,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import Copy from './copy';
import UnitDisplay from './unitDisplay';

const AssetPopover = ({ asset, gutter, ...props }) => {
  return (
    <Popover placement="top-start" gutter={gutter}>
      <PopoverTrigger>
        <Box>{props.children}</Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="98%">
          <PopoverArrow ml="4px" />
          <PopoverCloseButton />
          <PopoverBody
            py="-2"
            px="2"
            alignItems="center"
            justifyContent="center"
            display="flex"
            flexDirection="column"
            textAlign="center"
          >
            {asset && (
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
                <Text fontSize="xs" fontWeight="bold">
                  <UnitDisplay
                    quantity={asset.quantity}
                    decimals={asset.decimals}
                  />
                </Text>
                <Box h="2" />
                <Copy label="Copied policy" copy={asset.policy}>
                  <Box fontSize="xx-small">
                    <span>
                      <b>Policy:</b> {asset.policy}
                    </span>
                  </Box>
                </Copy>
                <Box h="1" />
                <Copy
                  width="full"
                  label="Copied asset"
                  copy={asset.fingerprint}
                >
                  <Box fontSize="xx-small">
                    <span>
                      <b>Asset:</b> {asset.fingerprint}
                    </span>
                  </Box>
                </Copy>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default AssetPopover;
