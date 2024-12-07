import React from 'react';
import { useColorMode, Box } from '@chakra-ui/react';
import { Slide } from '../slide.component';
import { ReactComponent as Download } from '../../assets/download.svg';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { ReactComponent as PendingDark } from '../../assets/pending-dark-mode.svg';
import { ReactComponent as PendingWhite } from '../../assets/pending-white-mode.svg';

export const AlmostThere = ({
  isLaceInstalled,
  onAction,
  isDismissable,
  dismissibleSeconds,
}) => {
  const { colorMode } = useColorMode();
  return (
    <Slide
      showTerms={false}
      title={
        isLaceInstalled ? "It's time to upgrade your wallet!" : 'Let’s begin...'
      }
      image={
        <Box mb={'60px'}>
          {colorMode === 'light' ? (
            <PendingWhite width="103px" height="135px" />
          ) : (
            <PendingDark width="103px" height="135px" />
          )}
        </Box>
      }
      description={
        isLaceInstalled
          ? 'Your Nami wallet is now part of the Lace family.'
          : 'Download the Lace extension to begin.'
      }
      buttonText={isLaceInstalled ? 'Open Lace' : 'Download Lace'}
      buttonIcon={isLaceInstalled ? Arrow : Download}
      onButtonClick={onAction}
      isDismissable={isDismissable}
      buttonOrientation="column"
      dismissibleSeconds={dismissibleSeconds}
    />
  );
};
