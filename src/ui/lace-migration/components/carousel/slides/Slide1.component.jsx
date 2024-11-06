import React from 'react';
import { Box } from '@chakra-ui/react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { ReactComponent as BackpackImg } from '../../../assets/backpack.svg';
import { useCaptureEvent } from '../../../../../features/analytics/hooks';
import { Events } from '../../../../../features/analytics/events';

export const Slide1 = ({ onAction, isDismissable, dismissibleSeconds }) => {
  const captureEvent = useCaptureEvent();
  return (
    <Slide
      showTerms
      title="It's time to upgrade your wallet!"
      image={
        <Box mb={'20px'}>
          <BackpackImg width="91px" height="126px" />
        </Box>
      }
      description="The Nami Wallet is now integrated into Lace. Click 'Upgrade your wallet' to begin the process."
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={async () => await onAction()}
      isDismissable={isDismissable}
      dismissibleSeconds={dismissibleSeconds}
      buttonOrientation={isDismissable ? 'column' : 'row'}
      onDismiss={async () =>
        captureEvent(Events.NamiMigrationDismissedNotStarted)
      }
    />
  );
};
