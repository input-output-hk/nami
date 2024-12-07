import React, { useState } from 'react';
import { Box, Button, useColorModeValue, Flex } from '@chakra-ui/react';
import { ReactComponent as Left } from '../../assets/chevron-left.svg';
import { ReactComponent as Right } from '../../assets/chevron-right.svg';
const CarouselButton = ({ children, ...rest }) => (
  <Button
    {...rest}
    variant="icon"
    h="auto"
    w="auto"
    p={0}
    color={useColorModeValue('#C0C0C0', '#A9A9A9')}
    _focus={{
      boxShadow: 'none',
    }}
    justifyContent="center"
  >
    {children}
  </Button>
);

export const Carousel = ({ children, onSlideSwitched }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex === 0 ? children.length - 1 : prevIndex - 1;
      onSlideSwitched?.(nextIndex);
      return nextIndex;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex === children.length - 1 ? 0 : prevIndex + 1;
      onSlideSwitched?.(nextIndex);
      return nextIndex;
    });
  };

  return (
    <Box display="flex">
      <Flex h="375px" width="48px" justifyContent="center">
        <CarouselButton onClick={prevSlide}>
          <Left />
        </CarouselButton>
      </Flex>

      <Box>{children[currentIndex]}</Box>
      <Flex h="375px" width="48px" justifyContent="center">
        <CarouselButton onClick={nextSlide}>
          <Right />
        </CarouselButton>
      </Flex>
    </Box>
  );
};
