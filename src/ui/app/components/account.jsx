import React from 'react';
import { avatarToImage, getCurrentAccount } from '../../../api/extension';
import { Box, Text } from '@chakra-ui/layout';

const Account = ({ account }) => {
  return (
    <Box
      height="16"
      roundedBottom="3xl"
      background="teal.400"
      shadow="md"
      width="full"
      position="relative"
    >
      <Box
        zIndex="2"
        position="absolute"
        top="13px"
        right="6"
        rounded="full"
        background="white"
        width="10"
        height="10"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {account && <img src={avatarToImage(account.avatar)} width="76%" />}
      </Box>
      <Box
        zIndex="1"
        position="absolute"
        width="full"
        top="18px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white" fontSize="lg">
          {account && account.name}
        </Text>
      </Box>
    </Box>
  );
};

export default Account;
