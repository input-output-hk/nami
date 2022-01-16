/**
 * @jest-environment jsdom
 */

import { on, off } from '../../../../api/webpage/eventRegistration';
import { TARGET } from '../../../../config/config';

describe('webpage/eventRegistring', () => {
  const makeEvent = (eventType, detail) =>
    new CustomEvent(`${TARGET}${eventType}`, { detail });

  describe('on', () => {
    beforeEach(() => {
      window.cardano = {
        nami: {
          _events: {},
        },
      };
    });

    test('invokes the callback when a the target event is triggered', () => {
      const eventType = 'mock-event';
      const mockPayload = 'mock-payload';
      const event = makeEvent(eventType, mockPayload);
      const mockFn = jest.fn();

      on(eventType, mockFn);

      window.dispatchEvent(event);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(mockPayload);
    });

    test('does not invoke the callback when a different event is triggered', () => {
      const mockFn = jest.fn();

      on('event-A', mockFn);

      const mockPayload = 'mock-payload';
      const event = makeEvent('event-B', mockPayload);

      window.dispatchEvent(event);

      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('of', () => {
    const mockEventType = 'mock-event';
    const mockCallback = jest.fn();
    const mockHandler = jest.fn().mockImplementation(() => mockCallback());

    beforeEach(() => {
      jest.resetAllMocks();

      window.cardano = {
        nami: {
          _events: {
            [mockEventType]: [[mockCallback, mockHandler]],
          },
        },
      };
    });

    test('clean out matching callbacks fom the given event', () => {
      off(mockEventType, mockCallback);

      expect(window.cardano.nami._events).toEqual({
        [mockEventType]: [],
      });
    });

    test('stops the given callback from being invoked when cleaned out', () => {
      off(mockEventType, mockCallback);

      const event = makeEvent(mockEventType);

      window.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('does not stop other callbacks from being invoked after cleaned one out', () => {
      const mockFn = jest.fn();

      on('event-A', mockFn);

      off('mockEventType', mockCallback);

      const event = makeEvent('event-A');

      window.dispatchEvent(event);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
