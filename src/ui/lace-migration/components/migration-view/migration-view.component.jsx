import React from 'react';
import { MigrationState } from '@xsy/nami-migration-tool/dist/migrator/migration-state.data';
import { Carousel } from '../carousel/carousel.component';
import { ItsTimetToUpgrade } from '../its-time-to-upgrade/its-time-to-upgrade.component';
import { SeamlessUpgrade } from '../seamless-upgrade/seamless-upgrade.component';
import { NewFeatures } from '../new-features/new-features.component';
import { AlmostThere } from '../almost-there/almost-there.component';
import { AllDone } from '../all-done/all-done.component';
import { useColorModeValue } from '@chakra-ui/react';

export const MigrationView = ({
  migrationState,
  isLaceInstalled,
  onUpgradeWalletClicked,
  onDownloadLaceClicked,
  onOpenLaceClicked,
}) => {
  const bgColor = useColorModeValue('#FFF', '#2E2E2E');
  switch (migrationState) {
    case MigrationState.None:
      return (
        <div style={{ padding: '30px 0', backgroundColor: bgColor }}>
          <Carousel>
            <ItsTimetToUpgrade key="1" onAction={onUpgradeWalletClicked} />
            <SeamlessUpgrade key="2" onAction={onUpgradeWalletClicked} />
            <NewFeatures key="3" onAction={onUpgradeWalletClicked} />
          </Carousel>
        </div>
      );

    case MigrationState.InProgress:
      return isLaceInstalled ? (
        <div style={{ padding: '30px 40px', backgroundColor: bgColor }}>
          <AlmostThere isLaceInstalled onAction={onOpenLaceClicked} />
        </div>
      ) : (
        <div style={{ padding: '30px 40px', backgroundColor: bgColor }}>
          <AlmostThere
            isLaceInstalled={false}
            onAction={onDownloadLaceClicked}
          />
        </div>
      );

    case MigrationState.Completed:
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
