import { CacheDriver } from '../types';

const noopCacheDriver: (...args) => CacheDriver = () => null;

export default noopCacheDriver;
