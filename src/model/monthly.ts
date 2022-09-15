import db from 'service/database';

export interface Monthly {
  month: string,
  bytes: number,
}

export default {
  async getBytes(month: string) {
    const row = await db<Monthly>('monthly').where({ month }).select('bytes').first();
    return row ? row.bytes : 0;
  },
  async incrementBytes(month: string, bytes: number) {
    const row = await db<Monthly>('monthly').where({ month }).select('bytes').first();
    if (!row) {
      await db<Monthly>('monthly').insert({ month, bytes: 0 });
    }
    await db<Monthly>('monthly').where({ month }).increment('bytes', bytes);
  },
  async resetBytes() {
    await db<Monthly>('monthly').delete();
  },
};
