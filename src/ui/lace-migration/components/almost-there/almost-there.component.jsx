import React from 'react';
import { useColorMode, Box } from '@chakra-ui/react';
import { Slide } from '../slide.component';
import { ReactComponent as Download } from '../../assets/download.svg';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { ReactComponent as PendingDark } from '../../assets/pending-dark-mode.svg';
import { ReactComponent as PendingWhite } from '../../assets/pending-white-mode.svg';

export const AlmostThere = ({ isLaceInstalled, onAction }) => {
  const { colorMode } = useColorMode();
  return (
    <Slide
      showTerms
      title="Almost there..."
      image={
        <Box mb={"60px"}>
          {colorMode === 'light' ? <PendingWhite width="98px" height="98px" /> : <PendingDark width="98px" height="98px" />}
        </Box>
      }
      description={
        isLaceInstalled
          ? ['Please open Lace', 'extension to proceed']
          : ['Please download Lace', 'extension to proceed']
      }
      buttonText={isLaceInstalled ? 'Open Lace' : 'Download Lace'}
      buttonIcon={isLaceInstalled ? Arrow : Download}
      onButtonClick={onAction}
    />
  );
};
