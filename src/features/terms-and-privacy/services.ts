import { getStorage, removeStorage, setStorage } from '../../api/extension';
import { STORAGE } from '../../config/config';

export const getAcceptedLegalDocsVersion = async (): Promise<
  number | undefined
> => {
  const version = await getStorage(STORAGE.acceptedLegalDocsVersion);

  if (version) {
    return Number(version);
  }

  return undefined;
};

export const setAcceptedLegalDocsVersion = (
  version: number | undefined
): Promise<boolean> => {
  if (version) {
    return setStorage({ [STORAGE.acceptedLegalDocsVersion]: version });
  }

  return removeStorage(STORAGE.acceptedLegalDocsVersion);
};
