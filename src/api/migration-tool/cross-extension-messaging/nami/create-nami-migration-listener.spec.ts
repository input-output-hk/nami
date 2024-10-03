import { createNamiMigrationListener } from './create-nami-migration-listener';
import {
  MIGRATION_KEY,
  MigrationState,
} from '../../migrator/migration-state.data';
import { State } from '../../migrator/nami-storage.data';
import { MigrationExceptions } from '../shared/exceptions';
import { fixture } from '../../migrator/nami-storage.fixture';
import { map } from '../../migrator/nami-storage-mapper.data';
import { createMockNamiStore } from '../shared/test-helpers';

describe('createNamiMigrationListener', () => {
  const LACE_ID = 'fakeLaceId';

  it('should return undefined for messages from other extensions than Lace', async () => {
    const namiMigrationListener = createNamiMigrationListener(
      LACE_ID,
      createMockNamiStore(),
    );
    expect(
      await namiMigrationListener(
        { type: 'status' },
        { id: 'fakeOtherExtensionId' },
      ),
    ).toBeUndefined();
  });

  it('should set migration state to none when receiving abort message from Lace', async () => {
    const store = createMockNamiStore();
    const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);
    const returnValue = await namiMigrationListener(
      { type: 'abort' },
      { id: LACE_ID },
    );
    expect(returnValue).toBeUndefined();
    expect(store.set).toHaveBeenCalledWith({
      [MIGRATION_KEY]: MigrationState.None,
    });
  });

  it('should set migration state to completed when receiving completed message from Lace', async () => {
    const store = createMockNamiStore();
    const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);
    const returnValue = await namiMigrationListener(
      { type: 'completed' },
      { id: LACE_ID },
    );
    expect(returnValue).toBeUndefined();
    expect(store.set).toHaveBeenCalledWith({
      [MIGRATION_KEY]: MigrationState.Completed,
    });
  });

  describe('Lace requesting status from Nami', () => {
    it('should return migration state none if no migration state has been saved', async () => {
      const store = createMockNamiStore();
      const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);
      const returnValue = await namiMigrationListener(
        { type: 'status' },
        { id: LACE_ID },
      );
      expect(returnValue).toBe(MigrationState.None);
    });
    it('should return the previously saved migration state', async () => {
      const savedState: Partial<State> = {
        laceMigration: MigrationState.Completed,
      };
      const store = createMockNamiStore(savedState);
      const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);

      const returnValue = await namiMigrationListener(
        { type: 'status' },
        { id: LACE_ID },
      );
      expect(returnValue).toBe(savedState.laceMigration);
    });
  });

  describe('Lace requesting data from Nami', () => {
    it('should throw an error if data cant be mapped', async () => {
      const store = createMockNamiStore({
        laceMigration: MigrationState.InProgress,
      });
      const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);
      await expect(
        namiMigrationListener({ type: 'data' }, { id: LACE_ID }),
      ).rejects.toBe(MigrationExceptions.FailedToParse);
    });

    it('should return mapped nami to migration state', async () => {
      const store = createMockNamiStore({
        laceMigration: MigrationState.InProgress,
        ...fixture,
      });
      const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);
      await expect(
        namiMigrationListener({ type: 'data' }, { id: LACE_ID }),
      ).resolves.toEqual(map(fixture));
    });

    it('should return the data also if migration was already completed in Nami', async () => {
      const store = createMockNamiStore({
        laceMigration: MigrationState.Completed,
        ...fixture,
      });
      const namiMigrationListener = createNamiMigrationListener(LACE_ID, store);
      await expect(
        namiMigrationListener({ type: 'data' }, { id: LACE_ID }),
      ).resolves.toEqual(map(fixture));
    });
  });
});
