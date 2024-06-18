import React from 'react';
import { Carousel } from './carousel.component';
import { ItsTimetToUpgrade } from '../its-time-to-upgrade/its-time-to-upgrade.component';
import { SeamlessUpgrade } from '../seamless-upgrade/seamless-upgrade.component';
import { NewFeatures } from '../new-features/new-features.component';
import { AlmostThere } from '../almost-there/almost-there.component';
import { AllDone } from '../all-done/all-done.component';

const meta = {
  title: 'Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: [
      <ItsTimetToUpgrade key="1" onAction={() => {}} />,
      <SeamlessUpgrade key="2" onAction={() => {}} />,
      <NewFeatures key="3" onAction={() => {}} />,
      <AlmostThere isLaceInstalled={false} key="4" onAction={() => {}} />,
      <AllDone key="5" onAction={() => {}} />,
    ],
  },
};

export default meta;

export const Primary = {};
