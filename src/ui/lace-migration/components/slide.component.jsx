import React from 'react';
import { Flex, Box, Button, Link, useColorModeValue } from '@chakra-ui/react';
import { Text } from './text.component';

export const Slide = ({
  title,
  image,
  description,
  showTerms,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
  noWallet
}) => {
  const borderColor = useColorModeValue('#C0C0C0', '#383838');
  const slideBoxBgColor = useColorModeValue('#FFFFFF', '#383838');
  const termsTextColor = useColorModeValue('#6F7786', '#A9A9A9');
  const buttonColor = useColorModeValue('#FFFFFF', '#FFFFFF');
  const noWalletButtonColor = useColorModeValue("#3D3B39", "#fff")
  const noWalletButtonBg = useColorModeValue('linear-gradient(#fff, #fff, #fff, #fff, #fff, #fff) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box', 'linear-gradient(rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46), rgb(46, 46, 46)) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box');
  const noWalletButtonBgHover = useColorModeValue('linear-gradient(#fff, #fff, #fff, #fff, #fff, #fff) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box', 'linear-gradient(#000, #000, #000, #000, #000, #000) padding-box, linear-gradient(94.22deg, #ff92e1 -18.3%, #fdc300 118.89%) border-box')

  const getButton = ({ noWallet }) => {
    if (noWallet) {
      // No Wallet Button with Lace icon
      return (
        <Button
          height="auto"
          borderRadius="16px"
          py="10px"
          w="100%"
          background={noWalletButtonBg}
          border="2px solid transparent"
          backgroundColor="none"
          _hover={{ bg: noWalletButtonBgHover }}
          onClick={onButtonClick}
        >
          <Flex alignItems="center">
            {Icon &&
              <Icon
                width="24px"
                height="24px"
                color={buttonColor}
              />
            }
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
      )
    }
    // Default Button
    return (
      <Button
        height="auto"
        borderRadius="16px"
        py="12px"
        w="100%"
        backgroundColor="#549CA1"
        onClick={onButtonClick}
      >
        <Flex alignItems="center">
          {Icon && <Icon color={buttonColor} />}
          <Text color={buttonColor} ml="6px" fontWeight="700">
            {buttonText}
          </Text>
        </Flex>
      </Button>
    )
  }

  const getTermsContent = ({ noWallet }) => {
    if (noWallet) {
      return (
        <>
          <Text color="current">
            Once created or imported, you can keep using your
          </Text>
          <Text color="current">
            wallet in the &quot;Nami mode&quot; interface{' '}
            <Link color="#3489F7" textDecoration="underline">
               Know more
            </Link>
          </Text>
        </>
      );
    }
    return (
      <>
        <Text color="current">
          By clicking at &quot;upgrade&quot; you agree with our Terms
        </Text>
        <Text color="current">
          <Link color="#3489F7" textDecoration="underline">
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link color="#3489F7" textDecoration="underline">
            Privacy Policy
          </Link>
        </Text>
      </>
    )
  }

  return (
    <Box>
      <Box
        w="299px"
        h="375px"
        mb="30px"
        borderWidth="1px"
        borderRadius="17.37px"
        paddingTop="38px"
        borderColor={borderColor}
        backgroundColor={slideBoxBgColor}
      >
        <Flex textAlign="center" alignItems="center" flexDirection="column">
          <Text mb="52px" fontSize="16px" fontWeight="700">
            {title}
          </Text>
          <Box>{image}</Box>
          {description.map((text) => (
            <Text key={text} fontSize="16px" fontWeight="400">
              {text}
            </Text>
          ))}
        </Flex>
      </Box>
      {showTerms &&
        <Box
          mb="20px"
          fontWeight="300"
          color={termsTextColor}
          fontSize={12}
          textAlign="center"
        >
          {getTermsContent({ noWallet })}
        </Box>
      }
      {buttonText && getButton({ noWallet })}
    </Box>
  );
};
