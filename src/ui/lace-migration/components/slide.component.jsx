import React from 'react';
import {
  Flex,
  Box,
  Button,
  Link,
  useColorModeValue,
  useColorMode,
  Image,
} from '@chakra-ui/react';
import { Text } from './text.component';
import { getColor } from './get-color';

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
  const backgroundColor = useColorModeValue('#FFFFFF', '#383838');
  const termsTextColor = useColorModeValue('#6F7786', '#A9A9A9');
  const secondaryColor = getColor('secondary', useColorMode().colorMode);
  return (
    <Box>
      <Box
        w="299px"
        h="375px"
        mb="30px"
        borderWidth="1px"
        borderRadius="17.37px"
        paddingTop="38px"
        color="primary"
        borderColor={borderColor}
        backgroundColor={backgroundColor}
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
          backgroundColor="#549CA1"
          onClick={onButtonClick}
        >
          <Flex color={secondaryColor} alignItems="center">
            {Icon && <Icon color="" />}
            <Text color="current" ml="6px" fontWeight="700">
              {buttonText}
            </Text>
          </Flex>
        </Button>
      )}
    </Box>
  );
};
