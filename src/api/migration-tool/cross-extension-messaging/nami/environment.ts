import secrets from '../../../../config/provider';

if (secrets.LACE_EXTENSION_ID === undefined) {
  throw new Error('LACE_EXTENSION_ID must be defined');
}
export const LACE_EXTENSION_ID = secrets.LACE_EXTENSION_ID;
