// @ts-expect-error
global.setImmediate = jest.useRealTimers;

jest.setTimeout(25000);
