import { getStorage, removeStorage, setStorage } from '../../api/extension';
import { STORAGE } from '../../config/config';

export const getAcceptedLegalDocsVersion = async (): Promise<
  number | undefined
> => {
  const version = await getStorage(STORAGE.acceptedLegalDocsVersion);

  return version ? Number(version) : undefined;
};

export const setAcceptedLegalDocsVersion = (
  version: number | undefined
): Promise<boolean> => {
  return version
    ? setStorage({ [STORAGE.acceptedLegalDocsVersion]: version })
    : removeStorage(STORAGE.acceptedLegalDocsVersion);
};
