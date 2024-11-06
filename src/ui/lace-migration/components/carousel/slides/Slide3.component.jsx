import React from 'react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { Box } from '@chakra-ui/react';
import { ReactComponent as FeaturesImg } from '../../../assets/features.svg';
import { useCaptureEvent } from '../../../../../features/analytics/hooks';
import { Events } from '../../../../../features/analytics/events';

export const Slide3 = ({ onAction, isDismissable, dismissibleSeconds }) => {
  const captureEvent = useCaptureEvent();
  return (
    <Slide
      showTerms
      title="Seamless switch"
      description="Migrate to Lace's new Nami mode with one single click!"
      image={
        <Box>
          <FeaturesImg width="262px" height="auto" />
        </Box>
      }
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
