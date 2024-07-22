import React from 'react';
import { MigrationState } from '@xsy/nami-migration-tool/dist/migrator/migration-state.data';
import { Carousel } from '../carousel/carousel.component';
import { Slide1 } from '../carousel/slides/Slide1.component';
import { Slide2 } from '../carousel/slides/Slide2.component';
import { Slide3 } from '../carousel/slides/Slide3.component';
import { AlmostThere } from '../almost-there/almost-there.component';
import { AllDone } from '../all-done/all-done.component';
import { NoWallet } from '../no-wallet/no-wallet.component';
import { useColorModeValue } from '@chakra-ui/react';

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

  if (!hasWallet) {
    return (
      <div style={{ padding: '30px 40px', backgroundColor: bgColor }}>
        <NoWallet
          isLaceInstalled={isLaceInstalled}
          onAction={onNoWalletActionClick}
        />
      </div>
    );
  }

  switch (migrationState) {
    case MigrationState.None:
      return (
        <div style={{ padding: '30px 0', backgroundColor: bgColor }}>
          <Carousel onSlideSwitched={onSlideSwitched}>
            <Slide1 key="1" onAction={onUpgradeWalletClicked} />
            <Slide2 key="2" onAction={onUpgradeWalletClicked} />
            <Slide3 key="3" onAction={onUpgradeWalletClicked} />
          </Carousel>
        </div>
      );

    case MigrationState.InProgress:
      if (!isLaceInstalled) {
        onWaitingForLaceScreenViewed?.();
        return (
          <div style={{ padding: '30px 40px', backgroundColor: bgColor }}>
            <AlmostThere
              isLaceInstalled={false}
              onAction={onDownloadLaceClicked}
            />
          </div>
        );
      } else {
        onOpenLaceScreenViewed?.();
        return (
          <div style={{ padding: '30px 40px', backgroundColor: bgColor }}>
            <AlmostThere isLaceInstalled onAction={onOpenLaceClicked} />
          </div>
        );
      }

    case MigrationState.Completed:
      onAllDoneScreenViewed?.();
      return (
        <div style={{ padding: '30px 40px', backgroundColor: bgColor }}>
          <AllDone
            isLaceInstalled={isLaceInstalled}
            onAction={
              isLaceInstalled ? onOpenLaceClicked : onDownloadLaceClicked
            }
          />
        </div>
      );
  }
};
