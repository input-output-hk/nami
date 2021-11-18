import React from 'react';
import { POPUP, POPUP_WINDOW, TAB } from '../config/config';
import { Scrollbars } from 'react-custom-scrollbars';
import './app/components/styles.css';
import Theme from './theme';
import StoreProvider from './store';
import { Box, IconButton } from '@chakra-ui/react';
import { ChevronUpIcon } from '@chakra-ui/icons';

const isMain = window.document.querySelector(`#${POPUP.main}`);
const isTab = window.document.querySelector(`#${TAB.hw}`);

const Main = ({ children }) => {
  const [scroll, setScroll] = React.useState({ el: null, y: 0 });

  React.useEffect(() => {
    window.document.body.addEventListener(
      'keydown',
      (e) => e.key === 'Escape' && e.preventDefault()
    );
    // Windows is somehow not opening the popup with the right size. Dynamically changing it, fixes it for now:
    if (navigator.userAgent.indexOf('Win') != -1 && !isMain && !isTab) {
      const width =
        POPUP_WINDOW.width + (window.outerWidth - window.innerWidth);
      const height =
        POPUP_WINDOW.height + (window.outerHeight - window.innerHeight);
      window.resizeTo(width, height);
    }
  }, []);
  return (
    <Box
      width={isMain ? POPUP_WINDOW.width + 'px' : '100%'}
      height={isMain ? POPUP_WINDOW.height + 'px' : '100vh'}
    >
      <Theme>
        <StoreProvider>
          <Scrollbars
            id="scroll"
            style={{ width: '100vw', height: '100vh' }}
            autoHide
            onScroll={(e) => {
              setScroll({ el: e.target, y: e.target.scrollTop });
            }}
          >
            {children}
            {scroll.y > 1200 && (
              <IconButton
                onClick={() => {
                  scroll.el.scrollTo({ behavior: 'smooth', top: 0 });
                }}
                position="fixed"
                bottom="15px"
                right="15px"
                size="sm"
                rounded="xl"
                colorScheme="teal"
                opacity={0.85}
                icon={<ChevronUpIcon />}
              ></IconButton>
            )}
          </Scrollbars>
        </StoreProvider>
      </Theme>
    </Box>
  );
};

export default Main;
