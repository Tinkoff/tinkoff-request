import noop from '@tinkoff/utils/function/noop';
import { ensureDirSync, writeJSON, readJSON } from 'fs-extra';
import path from 'path';
import { CacheDriver } from '../types';
import md5 from './md5';

const KEY_LIMIT = 100;

export const driver = ({
    name = 'fallback',
    basePath = './.tmp/server-cache/',
}: {
    name?: string;
    basePath?: string;
} = {}): CacheDriver => {
    const cacheDir = path.normalize(`${basePath}/${name}`);

    ensureDirSync(cacheDir);

    const getFileName = (key: string) => {
        const name = encodeURIComponent(key.length > KEY_LIMIT ? md5(key) : key);

        return path.normalize(`${cacheDir}/${name}.json`);
    };

    return {
        get(key) {
            return readJSON(getFileName(key));
        },
        set(key, response) {
            writeJSON(getFileName(key), response).catch(noop);
        },
    };
};
