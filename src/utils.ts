import bytes from 'bytes';
import parseDuration from 'parse-duration';

export const formatBytes = (n: number) => bytes(n).toLowerCase();
export const parseBytes = (s: string) => bytes(s);
export const parseMillis = (s: string) => parseDuration(s);
