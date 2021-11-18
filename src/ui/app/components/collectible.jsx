import { Box } from '@chakra-ui/layout';
import { Avatar, Image, Skeleton, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import './styles.css';
import { Transition } from 'react-transition-group';
import { getAsset } from '../../../api/extension';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const Collectible = React.forwardRef(({ asset }, ref) => {
  const isMounted = useIsMounted();
  const [token, setToken] = React.useState(null);
  const background = useColorModeValue('gray.300', 'white');
  const [showInfo, setShowInfo] = React.useState(false);

  const fetchMetadata = async () => {
    const detailedAsset = {
      ...(await getAsset(asset.unit)),
      quantity: asset.quantity,
    };
    if (!isMounted.current) return;
    setToken(detailedAsset);
  };

  React.useEffect(() => {
    fetchMetadata();
  }, [asset]);
  return (
    <>
      <Box
        onClick={() => token && ref.current.openModal(token)}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width="160px"
        height="160px"
        overflow="hidden"
        rounded="3xl"
        background={background}
        border="solid 1px"
        borderColor={background}
        onMouseEnter={() => {
          setShowInfo(true);
        }}
        onMouseLeave={() => setShowInfo(false)}
        cursor="pointer"
        userSelect="none"
      >
        <Box
          filter={showInfo && 'brightness(0.6)'}
          width="180%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {!token ? (
            <Skeleton width="210px" height="210px" />
          ) : (
            <Image
              width="full"
              rounded="sm"
              src={token.image}
              fallback={
                !token.image ? (
                  <Avatar width="210px" height="210px" name={token.name} />
                ) : (
                  <Fallback name={token.name} />
                )
              }
            />
          )}
        </Box>
        {token && (
          <Box width="full" position="absolute" bottom={0} left={0}>
            <Transition in={showInfo} timeout={200}>
              {(state) => {
                const defaultStyle = {
                  transition: '0.2s',
                  bottom: '0',
                };

                const transitionStyles = {
                  entering: { bottom: 0 },
                  entered: { bottom: 0 },
                  exiting: { bottom: '-130px' },
                  exited: { bottom: '-130px' },
                };
                return (
                  <Box
                    position="absolute"
                    width="full"
                    height="130px"
                    background="white"
                    style={{ ...defaultStyle, ...transitionStyles[state] }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    color="black"
                  >
                    <Box
                      overflow="hidden"
                      className="lineClamp3"
                      fontSize={13}
                      fontWeight="bold"
                      color="GrayText"
                      textAlign="center"
                      width="80%"
                    >
                      {token.displayName}
                    </Box>
                    <Box
                      color="gray.600"
                      fontWeight="semibold"
                      position="absolute"
                      left="15px"
                      bottom="10px"
                    >
                      x {token.quantity}
                    </Box>
                  </Box>
                );
              }}
            </Transition>
          </Box>
        )}
      </Box>
    </>
  );
});

const Fallback = ({ name }) => {
  const [timedOut, setTimedOut] = React.useState(false);
  const isMounted = useIsMounted();
  React.useEffect(() => {
    setTimeout(() => isMounted.current && setTimedOut(true), 30000);
  }, []);
  if (timedOut) return <Avatar width="210px" height="210px" name={name} />;
  return <Skeleton width="210px" height="210px" />;
};

export default Collectible;
