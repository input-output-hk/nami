import React from 'react';
import { Flex, Box, Button, Link, useColorModeValue } from '@chakra-ui/react';
import { Text } from './text.component';
import { DismissBtn } from './dismiss-btn';

export const Slide = ({
  title,
  image,
  description,
  showTerms,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
  noWallet,
  isDismissable,
  dismissibleSeconds,
  buttonOrientation,
}) => {
  const borderColor = useColorModeValue('#C0C0C0', '#383838');
  const slideBoxBgColor = useColorModeValue('#FFFFFF', '#2D3848');
  const termsTextColor = useColorModeValue('#6F7786', '#FFFFFF');
  const buttonTextColor = useColorModeValue('#FFFFFF', '#000000');
  const buttonBgColor = useColorModeValue('#549CA1', '#4FD1C5');
  const noWalletButtonColor = useColorModeValue('#3D3B39', '#fff');
  const noWalletButtonBg = useColorModeValue(
    'linear-gradient(#fff, #fff, #fff, #fff, #fff, #fff) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box',
    'linear-gradient(rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46)) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box'
  );
  const noWalletButtonBgHover = useColorModeValue(
    'linear-gradient(#fff, #fff, #fff, #fff, #fff, #fff) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box',
    'linear-gradient(#000, #000, #000, #000, #000, #000) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box'
  );

  const getButtons = ({ noWallet }) => {
    if (noWallet) {
      // No Wallet Button with Lace icon
      return (
        <Button
          height="auto"
          borderRadius="16px"
          py="10px"
          w="100%"
          flex={1}
          background={noWalletButtonBg}
          border="2px solid transparent"
          backgroundColor="none"
          _hover={{ bg: noWalletButtonBgHover }}
          onClick={onButtonClick}
        >
          <Flex alignItems="center">
            {Icon && (
              <Icon width="24px" height="24px" color={buttonTextColor} />
            )}
            <Text
              color={noWalletButtonColor}
              ml="6px"
              fontWeight="700"
              lineHeight="normal"
            >
              {buttonText}
            </Text>
          </Flex>
        </Button>
      );
    }
    // Default Button
    return (
      <Button
        height="auto"
        borderRadius="16px"
        py="12px"
        w="100%"
        flex={1}
        backgroundColor={buttonBgColor}
        onClick={onButtonClick}
      >
        <Flex alignItems="center">
          {Icon && <Icon color={buttonTextColor} />}
          <Text color={buttonTextColor} ml="6px" fontWeight="700">
            {buttonText}
          </Text>
        </Flex>
      </Button>
    );
  };

  const getTermsContent = () => {
    return (
      <>
        <Text color="current">
          By clicking &quot;Upgrade&quot;, you agree with our
        </Text>
        <Text color="current">
          <Link color="#3489F7" textDecoration="underline">
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link color="#3489F7" textDecoration="underline">
            Privacy Policy
          </Link>
          .
        </Text>
      </>
    );
  };

  return (
    <Flex
      justifyContent={'space-between'}
      flexDirection={'column'}
      height={'100%'}
    >
      <Box
        w="100%"
        h="375px"
        mb="30px"
        borderWidth="1px"
        borderRadius="17.37px"
        padding="20px"
        borderColor={borderColor}
        backgroundColor={slideBoxBgColor}
      >
        <Flex
          textAlign="center"
          h={'100%'}
          alignItems="center"
          justifyContent={'space-between'}
          flexDirection="column"
        >
          <Text fontSize="16px" fontWeight="700">
            {title}
          </Text>
          <Box>{image}</Box>
          <Text fontSize="16px" fontWeight="400">
            {description}
          </Text>
        </Flex>
      </Box>
      <Box>
        {showTerms && (
          <Box
            mb="20px"
            fontWeight="300"
            color={termsTextColor}
            fontSize={12}
            textAlign="center"
          >
            {getTermsContent()}
          </Box>
        )}
        <Flex
          align="center"
          gap={'9px'}
          flexDirection={buttonOrientation === 'column' ? 'column' : 'row'}
        >
          {buttonText && getButtons({ noWallet })}
          {isDismissable && !!dismissibleSeconds && (
            <DismissBtn
              hasIcon={buttonOrientation === 'column'}
              dismissableIntervalSeconds={dismissibleSeconds}
            />
          )}
        </Flex>
      </Box>
    </Flex>
  );
};
