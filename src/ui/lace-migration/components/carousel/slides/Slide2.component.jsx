import React from 'react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { ReactComponent as SeamlessDark } from '../../../assets/grouped-dark-mode.svg';
import { ReactComponent as SeamlessWhite } from '../../../assets/grouped-white-mode.svg';
import { useColorMode, Box } from '@chakra-ui/react';

export const Slide2 = ({ onAction, isDismissable, dismissibleSeconds }) => {
  const { colorMode } = useColorMode();
  return (
    <Slide
      showTerms
      title="It's time to upgrade your wallet!"
      image={
        <Box mb={'40px'}>
          {colorMode === 'light' ? (
            <SeamlessWhite width="208px" height="102px" />
          ) : (
            <SeamlessDark width="208px" height="102px" />
          )}
        </Box>
      }
      description="Your Nami wallet is now part of the Lace family"
      buttonText="Upgrade"
      buttonIcon={Arrow}
      onButtonClick={onAction}
      isDismissable={isDismissable}
      dismissibleSeconds={dismissibleSeconds}
      buttonOrientation="row"
    />
  );
};
