import {
  Box,
  Button,
  Flex,
  Spacer,
  Switch,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React, { useRef } from 'react';
import { useAnalyticsConsent } from '../../analytics/hooks';
import { ChevronRightIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import PrivacyPolicy from '../../../ui/app/components/privacyPolicy';
import TermsOfUse from '../../../ui/app/components/termsOfUse';

export const LegalSettings = () => {
  const [analyticsConsent, setAnalyticsConsent] = useAnalyticsConsent();
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
          <Tooltip
            label={
              <Box padding="1">
                We'll collect anonymous analytics info from your browser
                extension to help us improve the quality and performance of Nami
              </Box>
            }
            fontSize="sm"
            hasArrow
            placement="auto"
          >
            <InfoOutlineIcon
              cursor="help"
              color="#4A5568"
              ml="10px"
              width="14px"
              height="14px"
              display="inline-block"
            />
          </Tooltip>
        </Text>
        <Spacer />
        <Switch
          isChecked={analyticsConsent}
          onChange={() => setAnalyticsConsent(!analyticsConsent)}
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
