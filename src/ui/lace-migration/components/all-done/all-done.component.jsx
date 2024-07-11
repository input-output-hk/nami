import React from 'react';
import { useColorMode, Box } from '@chakra-ui/react';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { ReactComponent as DoneDark } from '../../assets/done-dark.svg';
import { ReactComponent as DoneWhite } from '../../assets/done-white.svg';

export const AllDone = ({ isLaceInstalled, onAction }) => {
  const { colorMode } = useColorMode();
  return (
    <Slide
      title="All done!"
      image={
        <Box mb={'50px'}>
          {colorMode === 'light' ? (
            <DoneWhite width="98px" height="98px" />
          ) : (
            <DoneDark width="98px" height="98px" />
          )}
        </Box>
      }
      description={[
        'All good. Just use the Lace',
        'extension to access your migrated',
        'Nami Wallet from now on',
      ]}
      buttonText={isLaceInstalled ? 'Open Lace' : 'Download Lace'}
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
