if (process.env.LACE_EXTENSION_ID === undefined) {
  throw new Error('process.env.LACE_EXTENSION_ID must be defined');
}
export const LACE_EXTENSION_ID = process.env.LACE_EXTENSION_ID;
