import { STORAGE } from '../config/config';
import { getStorage, setStorage } from '../api/util';
const { version } = require('../../package.json');

let migrations = [
  {
    version: '1.0.0',
    up: () => {},
    down: () => {},
  },
];

export async function checkStorage() {
  const storage = await getStorage(STORAGE.migration);

  if (!storage.migration) {
    init();
    return checkStorage();
  }

  if (
    storage.migration.version !== version ||
    !storage.migration.completed.includes(version)
  )
    migrate();
}

export async function migrate() {
  let storage = await getStorage(STORAGE.migration);
  const storageState = compareVersion(storage.migration.version, version);

  let start, end;

  switch (storageState) {
    case 1: // Storage state is over current app version
      migrations.sort((a, b) => compareVersion(b.version, a.version));

      start = migrations.findIndex(
        (migration) =>
          compareVersion(migration.version, storage.migration.version) <= 0
      );

      end = migrations.findIndex(
        (migration) => compareVersion(migration.version, version) <= 0
      );

      if (start >= 0) {
        migrations =
          end > -1 ? migrations.slice(start, end) : migrations.slice(start);

        migrations.forEach((migration) => {
          let indexToRemove = storage.migration.completed.findIndex(
            (version) => version === migration.version
          );

          if (indexToRemove >= 0) {
            migration.down();
            storage.migration.completed.splice(indexToRemove, 1);
            console.log(`Storage migration applied: ${migration.version} DOWN`);
          }
        });
      }

      break;
    default:
      // Storage state is under or equal to current app version
      migrations.sort((a, b) => compareVersion(a.version, b.version));

      start = migrations.findIndex(
        (migration) =>
          compareVersion(migration.version, storage.migration.version) >= 0
      );

      end = migrations.findIndex(
        (migration) => compareVersion(migration.version, version) > 0
      );

      if (start >= 0) {
        migrations =
          end > -1 ? migrations.slice(start, end) : migrations.slice(start);

        migrations.forEach((migration) => {
          if (!storage.migration.completed.includes(migration.version)) {
            migration.up();
            storage.migration.completed.push(migration.version);
            console.log(`Storage migration applied: ${migration.version} UP`);
          }
        });
      }
  }

  storage.migration.version = version;
  setStorage(storage);
}

async function init() {
  return await setStorage({
    [STORAGE.migration]: {
      version: '0',
      completed: [],
    },
  });
}

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
