import { State } from '../../migrator/nami-storage.data';

export const createMockNamiStore = (mockedState: Partial<State> = {}) => {
  const store = {
    set: jest.fn(),
    get: jest.fn(),
  };
  store.get.mockResolvedValue(mockedState);
  return store;
};
