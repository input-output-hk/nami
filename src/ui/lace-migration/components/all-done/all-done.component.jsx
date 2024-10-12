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
      title="It's time to upgrade your wallet!"
      image={
        <Box mb={'50px'}>
          {colorMode === 'light' ? (
            <DoneWhite width="103px" height="135px" />
          ) : (
            <DoneDark width="103px" height="135px" />
          )}
        </Box>
      }
      description="Your Nami wallet is now part of the Lace family"
      buttonText={isLaceInstalled ? 'Open Lace' : 'Download Lace'}
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
