import db from 'service/database';
import proxy from 'service/proxy';

(async () => {
  await proxy.reset();
  await db.destroy();
})();
