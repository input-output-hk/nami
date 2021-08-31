import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/popover';
import { Box, Link, Stack, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Portal } from '@chakra-ui/portal';
import { FixedSizeList as List } from 'react-window';
import { Avatar } from '@chakra-ui/avatar';
import Copy from './copy';

import MiddleEllipsis from 'react-middle-ellipsis';

const abs = (big) => {
  return big < 0 ? big * BigInt(-1) : big;
};

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = React.useCallback((scrollbarsRef) => {
    if (scrollbarsRef) {
      forwardedRef(scrollbarsRef.view);
    }
  }, []);

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...style, overflow: 'hidden', marginRight: 4 }}
      onScroll={onScroll}
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

const AssetsPopover = ({ assets, isDifference }) => {
  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Button
          size="xs"
          onClick={(e) => e.stopPropagation()}
          style={{
            all: 'revert',
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            color: 'inherit',
            fontWeight: 'bold',
            display: 'inline-block',
            padding: '2px 4px',
          }}
          _hover={{ all: 'revert' }}
        >
          {assets.length} Asset
          {assets.length > 1 ? 's' : ''} <ChevronDownIcon cursor="pointer" />
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent onClick={(e) => e.stopPropagation()} w="98%">
          <PopoverArrow ml="4px" />
          <PopoverCloseButton />
          <PopoverHeader fontWeight="bold">Assets</PopoverHeader>
          <PopoverBody p="-2">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              my="1"
            >
              {assets && (
                <List
                  outerElementType={CustomScrollbarsVirtualList}
                  height={200}
                  itemCount={assets.length}
                  itemSize={45}
                  width={385}
                  layout="vertical"
                >
                  {({ index, style }) => {
                    const asset = assets[index];
                    return (
                      <Box
                        key={index}
                        style={style}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Box
                          width="100%"
                          ml="3"
                          display="flex"
                          alignItems="center"
                          justifyContent="start"
                        >
                          <Stack
                            width="100%"
                            fontSize="xs"
                            direction="row"
                            alignItems="center"
                            justifyContent="start"
                          >
                            <Avatar
                              userSelect="none"
                              size="xs"
                              name={asset.name}
                            />

                            <Box
                              textAlign="left"
                              width="200px"
                              whiteSpace="nowrap"
                              fontWeight="normal"
                            >
                              <Copy
                                label="Copied asset"
                                copy={asset.fingerprint}
                              >
                                <Box mb="-0.5">
                                  <MiddleEllipsis>
                                    <span>{asset.name}</span>
                                  </MiddleEllipsis>
                                </Box>
                                <Box
                                  whiteSpace="nowrap"
                                  fontSize="xx-small"
                                  fontWeight="light"
                                >
                                  <MiddleEllipsis>
                                    <span>Policy: {asset.policy}</span>
                                  </MiddleEllipsis>
                                </Box>
                              </Copy>
                            </Box>
                            <Box>
                              <Text
                                fontWeight="bold"
                                color={
                                  isDifference
                                    ? asset.quantity <= 0
                                      ? 'red.500'
                                      : 'green.500'
                                    : 'inherit'
                                }
                              >
                                {isDifference
                                  ? asset.quantity <= 0
                                    ? '-'
                                    : '+'
                                  : '+'}{' '}
                                {abs(asset.quantity).toString()}
                              </Text>
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    );
                  }}
                </List>
              )}
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default AssetsPopover;
