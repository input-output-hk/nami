import React, { useEffect } from 'react';
import {
  MigrationState,
  IS_HAVING_ISSUES,
} from '../../../../api/migration-tool/migrator/migration-state.data';
import { Carousel } from '../carousel/carousel.component';
import { Slide1 } from '../carousel/slides/Slide1.component';
import { Slide2 } from '../carousel/slides/Slide2.component';
import { Slide3 } from '../carousel/slides/Slide3.component';
import { AlmostThere } from '../almost-there/almost-there.component';
import { AllDone } from '../all-done/all-done.component';
import { NoWallet } from '../no-wallet/no-wallet.component';
import { useColorModeValue, Flex, Link } from '@chakra-ui/react';
import { useFeatureFlagsContext } from '../../../../features/feature-flags/provider';
import { Events } from '../../../../features/analytics/events';
import { useCaptureEvent } from '../../../../features/analytics/hooks';
import { AnalyticsConsentModal } from '../../../../features/analytics/ui/AnalyticsConsentModal';
import { useAnalyticsContext } from '../../../../features/analytics/provider';
import { storage } from 'webextension-polyfill';

export const MigrationView = ({
  migrationState,
  isLaceInstalled,
  onSlideSwitched,
  onWaitingForLaceScreenViewed,
  onOpenLaceScreenViewed,
  onAllDoneScreenViewed,
  onUpgradeWalletClicked,
  onDownloadLaceClicked,
  onOpenLaceClicked,
  onNoWalletActionClick,
  hasWallet,
}) => {
  const panelBg = useColorModeValue('#349EA3', 'gray.800');
  const bgColor = useColorModeValue('#FFF', '#1A202C');
  const { featureFlags } = useFeatureFlagsContext();
  const [analytics, setAnalyticsConsent] = useAnalyticsContext();
  const captureEvent = useCaptureEvent();
  useEffect(() => {
    captureEvent(Events.MigrationViewed);
  }, []);

  const isDismissable =
    featureFlags?.['is-migration-active']?.dismissable || false;

  const dismissibleSeconds =
    featureFlags?.['is-migration-active']?.dismissInterval;

  const hasShowIssuesButton =
    featureFlags?.['show-having-issues-button'] || false;

  const handleHavingIssuesClick = () => {
    storage.local.set({ [IS_HAVING_ISSUES]: true });
    captureEvent(Events.NamiMigrationHavingIssuesClick);
  };

  if (!hasWallet) {
    captureEvent(Events.MigrationViewNoWalletViewed);
    return (
      <>
        <Flex h="100%" backgroundColor={panelBg}>
          <Flex
            pt="40px"
            pb="30px"
            px="40px"
            borderTopRadius="20px"
            backgroundColor={bgColor}
            mt="17px"
            flexDirection="column"
            h="calc(100% - 17px)"
            w="100%"
          >
            <NoWallet
              isLaceInstalled={isLaceInstalled}
              onAction={onNoWalletActionClick}
              isDismissable={isDismissable}
              dismissibleSeconds={dismissibleSeconds}
            />
          </Flex>
        </Flex>
        <AnalyticsConsentModal
          askForConsent={analytics.consent === undefined}
          setConsent={setAnalyticsConsent}
        />
      </>
    );
  }

  switch (migrationState) {
    case MigrationState.Dismissed:
    case MigrationState.None:
      captureEvent(Events.MigrationNoStartedViewed);
      return (
        <Flex h="100%" backgroundColor={panelBg}>
          <Flex
            flexDirection={'column'}
            pt="40px"
            pb="30px"
            px="0px"
            borderTopRadius="20px"
            backgroundColor={bgColor}
            mt="17px"
            h="calc(100% - 17px)"
            w="100%"
          >
            <Carousel onSlideSwitched={onSlideSwitched}>
              <Slide1
                key="1"
                onAction={onUpgradeWalletClicked}
                isDismissable={isDismissable}
                dismissibleSeconds={dismissibleSeconds}
              />
              <Slide2
                key="2"
                onAction={onUpgradeWalletClicked}
                isDismissable={isDismissable}
                dismissibleSeconds={dismissibleSeconds}
              />
              <Slide3
                key="3"
                onAction={onUpgradeWalletClicked}
                isDismissable={isDismissable}
                dismissibleSeconds={dismissibleSeconds}
              />
            </Carousel>
          </Flex>
        </Flex>
      );

    case MigrationState.InProgress:
      if (!isLaceInstalled) {
        onWaitingForLaceScreenViewed?.();
        return (
          <Flex h="100%" backgroundColor={panelBg}>
            <Flex
              pt="40px"
              pb="30px"
              px="40px"
              borderTopRadius="20px"
              backgroundColor={bgColor}
              mt="17px"
              flexDirection="column"
              h="calc(100% - 17px)"
              w="100%"
            >
              <AlmostThere
                isLaceInstalled={false}
                onAction={onDownloadLaceClicked}
                isDismissable={isDismissable}
                dismissibleSeconds={dismissibleSeconds}
              />
            </Flex>
          </Flex>
        );
      } else {
        onOpenLaceScreenViewed?.();
        return (
          <Flex h="100%" backgroundColor={panelBg}>
            <Flex
              pt="40px"
              pb="30px"
              px="40px"
              borderTopRadius="20px"
              backgroundColor={bgColor}
              mt="17px"
              flexDirection="column"
              h="calc(100% - 17px)"
              w="100%"
            >
              <AlmostThere
                isLaceInstalled
                onAction={onOpenLaceClicked}
                isDismissable={isDismissable}
                dismissibleSeconds={dismissibleSeconds}
              />
            </Flex>
          </Flex>
        );
      }

    case MigrationState.Completed:
      onAllDoneScreenViewed?.();
      return (
        <Flex h="100%" backgroundColor={panelBg}>
          <Flex
            pt="40px"
            pb="30px"
            px="40px"
            borderTopRadius="20px"
            backgroundColor={bgColor}
            mt="17px"
            flexDirection="column"
            h="calc(100% - 17px)"
            w="100%"
          >
            <AllDone
              isLaceInstalled={isLaceInstalled}
              onAction={
                isLaceInstalled ? onOpenLaceClicked : onDownloadLaceClicked
              }
            />
            {hasShowIssuesButton && (
              <Link
                textAlign="center"
                marginTop={4}
                onClick={handleHavingIssuesClick}
              >
                Having issues? Click here to continue using Nami
              </Link>
            )}
          </Flex>
        </Flex>
      );
  }
};
