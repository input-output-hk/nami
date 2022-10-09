import { STORAGE } from '../config/config';
import { getStorage, setStorage } from '../api/extension';
import v1_1_5 from '../migrations/1.1.5';
import v1_1_7 from '../migrations/1.1.7';
import v2_0_0 from '../migrations/2.0.0';
import v2_1_0 from '../migrations/2.1.0';
import v2_2_0 from '../migrations/2.2.0';
import v2_3_0 from '../migrations/2.3.0';
import v2_3_2 from '../migrations/2.3.2';
import v2_3_3 from '../migrations/2.3.3';
import v3_0_0 from '../migrations/3.0.0';
import v3_0_2 from '../migrations/3.0.2';
import v3_3_0 from '../migrations/3.3.0';
const MIG_SCRIPTS = [
  v1_1_5,
  v1_1_7,
  v2_0_0,
  v2_1_0,
  v2_2_0,
  v2_3_0,
  v2_3_3,
  v3_0_0,
  v3_0_2,
  v3_3_0,
];
const { version } = require('../../package.json');
let pwd = null;
let migrations = MIG_SCRIPTS.map((migration) => ({
  version: migration.version,
  up: migration.up,
  down: migration.down,
  info: migration.info,
  pwdRequired: migration.pwdRequired,
}));

/**
 * Check if storage version matches app version
 * @return {Promise<boolean>}
 */
export async function needUpgrade() {
  const storage = await getStorage(STORAGE.migration);

  if (!storage) {
    await init();
    return false;
  }

  return storage.version !== version;
}

/**
 * Check whether a password is required or not
 * @return {Promise<boolean>}
 */
export async function needPWD() {
  if (pwd) return false;

  let migrationsScheduled = await migrate(true);
  let filtered = migrations.filter((migration) =>
    migrationsScheduled.some((ms) => ms.version === migration.version)
  );

  return filtered.some((migration) => migration.pwdRequired);
}

/**
 * Set storage password for decryption purpose
 */
export function setPWD(password) {
  pwd = password;
}

/**
 * Return TRUE if storage version is bellow or equal to app version
 * @return {Promise<boolean>}
 */
export async function isUpgrade() {
  let storage = await getStorage(STORAGE.migration);
  return compareVersion(storage.version, version) <= 0;
}

/**
 * Migrate storage to current version UP or DOWN
 *
 * @param {boolean} [dryRun=false] - Run without applying changes. Return versions arrays.
 * @return {Promise<array>}
 */
export async function migrate(dryRun = false) {
  let storage = await getStorage(STORAGE.migration);
  const storageState = compareVersion(storage.version, version);
  let output = [];

  let start, end;

  switch (storageState) {
    case 1: // Storage state is over current app version
      migrations.sort((a, b) => compareVersion(b.version, a.version));

      start = migrations.findIndex(
        (migration) => compareVersion(migration.version, storage.version) <= 0
      );

      end = migrations.findIndex(
        (migration) => compareVersion(migration.version, version) <= 0
      );

      if (start >= 0) {
        migrations =
          end > -1 ? migrations.slice(start, end) : migrations.slice(start);

        for (let i = 0; i < migrations.length; i++) {
          const migration = migrations[i];
          let indexToRemove = storage.completed.findIndex(
            (version) => version === migration.version
          );

          if (indexToRemove >= 0) {
            if (!dryRun) {
              await migration.down(migration.pwdRequired ? pwd : null);
              storage.completed.splice(indexToRemove, 1);
            }
            console.log(
              `${dryRun ? '[DRY RUN] ' : ''}Storage migration applied: ${
                migration.version
              } DOWN`
            );
            output.push({ version: migration.version, info: migration.info });
          }
        }
      }

      break;
    default:
      // Storage state is under or equal to current app version
      migrations.sort((a, b) => compareVersion(a.version, b.version));

      start = migrations.findIndex(
        (migration) => compareVersion(migration.version, storage.version) >= 0
      );

      end = migrations.findIndex(
        (migration) => compareVersion(migration.version, version) > 0
      );

      if (start >= 0) {
        migrations =
          end > -1 ? migrations.slice(start, end) : migrations.slice(start);

        for (let i = 0; i < migrations.length; i++) {
          const migration = migrations[i];
          if (!storage.completed.includes(migration.version)) {
            if (!dryRun) {
              await migration.up(migration.pwdRequired ? pwd : null);
              storage.completed.push(migration.version);
            }
            console.log(
              `${dryRun ? '[DRY RUN] ' : ''}Storage migration applied: ${
                migration.version
              } UP`
            );
            output.push({ version: migration.version, info: migration.info });
          }
        }
      }
  }

  if (!dryRun) {
    storage.version = version;
    setStorage({ [STORAGE.migration]: storage });
  }

  return output;
}

/**
 * Init migration key in storage
 * @return {Promise<void>}
 */
async function init() {
  await setStorage({
    [STORAGE.migration]: {
      version: version,
      completed: [],
    },
  });
}

/**
 * Compare version
 * @param v1
 * @param v2
 * @return {int}
 */
function compareVersion(v1, v2) {
  if (typeof v1 !== 'string') return false;
  if (typeof v2 !== 'string') return false;
  v1 = v1.split('.');
  v2 = v2.split('.');
  const k = Math.min(v1.length, v2.length);
  for (let i = 0; i < k; ++i) {
    v1[i] = parseInt(v1[i], 10);
    v2[i] = parseInt(v2[i], 10);
    if (v1[i] > v2[i]) return 1;
    if (v1[i] < v2[i]) return -1;
  }
  return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
}
