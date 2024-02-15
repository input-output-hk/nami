import {
  Box,
  Button,
  Flex,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Switch,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React, { useRef } from 'react';
import { ChevronRightIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import PrivacyPolicy from '../../../ui/app/components/privacyPolicy';
import TermsOfUse from '../../../ui/app/components/termsOfUse';
import { useAnalyticsContext } from '../../analytics/provider';

export const LegalSettings = () => {
  const [analytics, setAnalyticsConsent] = useAnalyticsContext();
  const termsRef = useRef<{ openModal: () => void }>();
  const privacyPolicyRef = useRef<{ openModal: () => void }>();
  return (
    <>
      <Box height="10" />
      <Text fontSize="lg" fontWeight="bold">
        Legal
      </Text>
      <Box height="6" />
      <Flex minWidth="65%" padding="0 16px" alignItems="center" gap="2">
        <Text fontSize="16" fontWeight="bold">
          Analytics
          <Popover autoFocus={false}>
            <PopoverTrigger>
              <InfoOutlineIcon
                cursor="pointer"
                color="#4A5568"
                ml="10px"
                width="14px"
                height="14px"
                display="inline-block"
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                <Text
                  color="grey"
                  fontWeight="500"
                  fontSize="14"
                  lineHeight="24px"
                >
                  We collect anonymous information from your browser extension
                  to help us improve the quality and performance of Nami. This
                  may include data about how you use our service, your
                  preferences and information about your system. Read more&nbsp;
                  <Link
                    onClick={() => window.open('https://namiwallet.io')}
                    textDecoration="underline"
                  >
                    here
                  </Link>
                  .
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Text>
        <Spacer />
        <Switch
          isChecked={analytics.consent}
          onChange={() => setAnalyticsConsent(!analytics.consent)}
        />
      </Flex>
      <Box height="3" />
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => termsRef.current?.openModal()}
      >
        Terms of Use
      </Button>
      <Box height="1" />
      <Button
        justifyContent="space-between"
        width="65%"
        rightIcon={<ChevronRightIcon />}
        variant="ghost"
        onClick={() => privacyPolicyRef.current?.openModal()}
      >
        Privacy Policy
      </Button>
      <PrivacyPolicy ref={privacyPolicyRef} />
      <TermsOfUse ref={termsRef} />
    </>
  );
};
