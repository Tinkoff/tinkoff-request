import { CacheDriver } from '../types';

export const driver: (...args) => CacheDriver = () => null;
