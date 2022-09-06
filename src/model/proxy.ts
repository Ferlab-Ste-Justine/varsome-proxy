import { tableName } from 'config/database';
import db from 'service/database';

export interface Proxy {
  data_consumed: number,
}

export default {
  async getDataConsumed() {
    const rows = await db<Proxy>(tableName).select('data_consumed');
    if (rows.length !== 1) {
      throw new Error('Table does not contain exactly one row');
    }
    return rows[0].data_consumed;
  },
  async incrementDataConsumed(bytes: number) {
    await db<Proxy>(tableName).increment('data_consumed', bytes);
  },
  async resetDataConsumed() {
    await db<Proxy>(tableName).update({ data_consumed: 0 });
  },
};
