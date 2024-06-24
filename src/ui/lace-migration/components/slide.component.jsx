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
}) => {
  const borderColor = useColorModeValue('#C0C0C0', '#383838');
  const slideBoxBgColor = useColorModeValue('#FFFFFF', '#2D3848');
  const termsTextColor = useColorModeValue('#6F7786', '#FFFFFF');
  const buttonTextColor = useColorModeValue('#FFFFFF', '#000000');
  const buttonBgColor = useColorModeValue('#549CA1', '#4FD1C5');
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
      {showTerms && (
        <Box
          mb="20px"
          fontWeight="300"
          color={termsTextColor}
          fontSize={12}
          textAlign="center"
        >
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
        </Box>
      )}
      {buttonText && (
        <Button
          height="auto"
          borderRadius="16px"
          py="12px"
          w="100%"
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
      )}
    </Box>
  );
};
