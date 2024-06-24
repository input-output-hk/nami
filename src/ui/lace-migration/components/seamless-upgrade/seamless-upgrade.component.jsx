import React from 'react';
import seamless from '../../assets/seamless.png';
import seamlessDark from '../../assets/seamless-dark.png';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { ReactComponent as SeamlessDark } from '../../assets/grouped-dark-mode.svg';
import { ReactComponent as SeamlessWhite } from '../../assets/grouped-white-mode.svg';
import { useColorMode, Box } from '@chakra-ui/react';

export const SeamlessUpgrade = ({ onAction }) => {
  const { colorMode } = useColorMode();
  return (
    <Slide
      showTerms
      title="Seamless wallet upgrade"
      image={
        <Box mb={"60px"}>
          {colorMode === 'light' ? <SeamlessWhite width="208px" height="102px" /> : <SeamlessDark width="208px" height="102px" />}
        </Box>
      }
      description={[
        'Nami will move your wallets to',
        'Lace extension automatically',
      ]}
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
