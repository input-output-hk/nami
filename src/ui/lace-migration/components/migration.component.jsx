import React, { useEffect, useState } from 'react';
import { Button, Text } from '@chakra-ui/react';
import { storage } from 'webextension-polyfill';
import {
  MIGRATION_KEY,
  MigrationState,
} from '@xsy/nami-migration-tool/dist/migrator/migration-state.data';

import {
  enableMigration,
  disableMigration,
} from '@xsy/nami-migration-tool/dist/cross-extension-messaging/nami-migration-client.extension';
import {
  AllDone,
  AlmostThere,
  ItsTimetToUpgrade,
  NewFeatures,
  SeamlessUpgrade,
  Carousel,
} from '.';

export const Migration = () => {
  return (
    <Carousel>
      <ItsTimetToUpgrade key="1" onAction={() => {}} />
      <SeamlessUpgrade key="2" onAction={() => {}} />
      <NewFeatures key="3" onAction={() => {}} />
      <AlmostThere key="4" onAction={() => {}} />
      <AllDone key="4" />
    </Carousel>
  );
};
