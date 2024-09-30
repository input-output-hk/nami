import React from 'react';
import { MigrationState } from 'nami-migration-tool/migrator/migration-state.data';
import { Carousel } from '../carousel/carousel.component';
import { Slide1 } from '../carousel/slides/Slide1.component';
import { Slide2 } from '../carousel/slides/Slide2.component';
import { Slide3 } from '../carousel/slides/Slide3.component';
import { AlmostThere } from '../almost-there/almost-there.component';
import { AllDone } from '../all-done/all-done.component';
import { NoWallet } from '../no-wallet/no-wallet.component';
import { useColorModeValue, Flex } from '@chakra-ui/react';
import { useFeatureFlagsContext } from '../../../../features/feature-flags/provider';

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
  const bgColor = useColorModeValue('#FFF', '#1A202C');
  const { featureFlags } = useFeatureFlagsContext();
  const isDismissable =
    featureFlags?.['is-migration-active']?.dismissable || false;

  const dismissibleSeconds =
    featureFlags?.['is-migration-active']?.dismissInterval;

  if (!hasWallet) {
    return (
      <Flex
        style={{ padding: '30px 40px', backgroundColor: bgColor }}
        flexDirection={'column'}
        h={'100%'}
      >
        <NoWallet
          isLaceInstalled={isLaceInstalled}
          onAction={onNoWalletActionClick}
          isDismissable={isDismissable}
          dismissibleSeconds={dismissibleSeconds}
        />
      </Flex>
    );
  }

  switch (migrationState) {
    case MigrationState.Dismissed:
    case MigrationState.None:
      return (
        <Flex
          style={{ padding: '30px 0px', backgroundColor: bgColor }}
          flexDirection={'column'}
          h={'100%'}
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
      );

    case MigrationState.InProgress:
      if (!isLaceInstalled) {
        onWaitingForLaceScreenViewed?.();
        return (
          <Flex
            style={{ padding: '30px 40px', backgroundColor: bgColor }}
            flexDirection={'column'}
            h={'100%'}
          >
            <AlmostThere
              isLaceInstalled={false}
              onAction={onDownloadLaceClicked}
              isDismissable={isDismissable}
              dismissibleSeconds={dismissibleSeconds}
            />
          </Flex>
        );
      } else {
        onOpenLaceScreenViewed?.();
        return (
          <Flex
            style={{ padding: '30px 40px', backgroundColor: bgColor }}
            flexDirection={'column'}
            h={'100%'}
          >
            <AlmostThere
              isLaceInstalled
              onAction={onOpenLaceClicked}
              isDismissable={isDismissable}
              dismissibleSeconds={dismissibleSeconds}
            />
          </Flex>
        );
      }

    case MigrationState.Completed:
      onAllDoneScreenViewed?.();
      return (
        <Flex
          style={{ padding: '30px 40px', backgroundColor: bgColor }}
          flexDirection={'column'}
          h={'100%'}
        >
          <AllDone
            isLaceInstalled={isLaceInstalled}
            onAction={
              isLaceInstalled ? onOpenLaceClicked : onDownloadLaceClicked
            }
          />
        </Flex>
      );
  }
};
