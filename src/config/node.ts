import dotenv from 'dotenv';

export enum Env { production = 'production', development = 'development', test = 'test' }
export enum Path { dist = 'dist', src = 'src' }
export enum Ext { js = 'js', ts = 'ts' }

dotenv.config();

const env = process.env.NODE_ENV || Env.development;

export default {
  env,
  path: env === Env.production ? Path.dist : Path.src,
  ext: env === Env.production ? Ext.js : Ext.ts,
};
