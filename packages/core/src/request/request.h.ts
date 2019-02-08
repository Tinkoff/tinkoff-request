import { Plugin, MakeRequest } from '../types.h';

export default interface TinkoffRequest {
    (plugins: Plugin[]) : MakeRequest;
}
