import * as SparkMD5 from 'spark-md5';

export default (payload: any): string => SparkMD5.hash(payload.toString());
