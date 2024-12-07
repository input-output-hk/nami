import React from 'react';
import { Carousel } from './carousel.component';
import { Slide1 } from './slides/Slide1.component';
import { Slide2 } from './slides/Slide2.component';
import { Slide3 } from './slides/Slide3.component';
import { AlmostThere } from '../almost-there/almost-there.component';
import { AllDone } from '../all-done/all-done.component';

const meta = {
  title: 'Nami Migration/Screens/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: [
      <Slide1 key="1" onAction={() => {}} />,
      <Slide2 key="2" onAction={() => {}} />,
      <Slide3 key="3" onAction={() => {}} />,
      <AlmostThere isLaceInstalled={false} key="4" onAction={() => {}} />,
      <AllDone key="5" onAction={() => {}} />,
    ],
  },
};

export default meta;

export const Primary = {};
