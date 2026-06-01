import { env } from '../config/env';

/** All feature services read this flag; screens never choose between mock and API. */
export const serviceConfig = {
  useMock: env.useMockApi,
} as const;
