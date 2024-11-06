import React from 'react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { ReactComponent as SeamlessDark } from '../../../assets/grouped-dark-mode.svg';
import { ReactComponent as SeamlessWhite } from '../../../assets/grouped-white-mode.svg';
import { useColorMode, Box } from '@chakra-ui/react';
import { useCaptureEvent } from '../../../../../features/analytics/hooks';
import { Events } from '../../../../../features/analytics/events';

export const Slide2 = ({ onAction, isDismissable, dismissibleSeconds }) => {
  const { colorMode } = useColorMode();
  const captureEvent = useCaptureEvent();
  return (
    <Slide
      showTerms
      title="Same experience, better infrastructure"
      image={
        <Box mb={'40px'}>
          {colorMode === 'light' ? (
            <SeamlessWhite width="208px" height="102px" />
          ) : (
            <SeamlessDark width="208px" height="102px" />
          )}
        </Box>
      }
      description="On the surface, Nami is the same. But now, with Lace's advanced technology supporting it."
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
      isDismissable={isDismissable}
      dismissibleSeconds={dismissibleSeconds}
      buttonOrientation={isDismissable ? 'column' : 'row'}
      onDismiss={async () =>
        captureEvent(Events.NamiMigrationDismissedNotStarted)
      }
    />
  );
};
