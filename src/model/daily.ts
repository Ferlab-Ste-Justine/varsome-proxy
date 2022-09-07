import { tableName } from 'config/database';
import db from 'service/database';

export interface Daily {
  day: string,
  bytes: number,
}

export default {
  async getBytes(day: string) {
    const row = await db<Daily>(tableName('daily')).where({ day }).select('bytes').first();
    return row ? row.bytes : 0;
  },
  async incrementBytes(day: string, bytes: number) {
    const row = await db<Daily>(tableName('daily')).where({ day }).select('bytes').first();
    if (!row) {
      await db<Daily>(tableName('daily')).insert({ day, bytes: 0 });
    }
    await db<Daily>(tableName('daily')).where({ day }).increment('bytes', bytes);
  },
  async resetBytes() {
    await db<Daily>(tableName('daily')).delete();
  },
};
