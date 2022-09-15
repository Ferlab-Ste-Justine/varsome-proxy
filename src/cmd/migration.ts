import { migrationConfig as config } from 'config/database';
import db from 'service/database';
import path from 'path';

const [action, name] = process.argv.slice(2);

(async () => {
  if (['latest', 'up', 'down', 'rollback'].includes(action)) {
    let direction = '';
    let list = [];
    switch (action) {
      case 'latest':
        direction = 'up';
        [, list] = await db.migrate.latest(config);
        break;
      case 'up':
        direction = 'up';
        [, list] = await db.migrate.up(config);
        break;
      case 'down':
        direction = 'down';
        [, list] = await db.migrate.down(config);
        break;
      case 'rollback':
        direction = 'down';
        [, list] = await db.migrate.rollback(config, true);
        break;
      default:
    }
    if (list.length > 0) {
      process.stdout.write(`Run ${list.length} migration${list.length > 1 ? 's' : ''} ${direction} :\n`);
      list.forEach((file: any) => {
        process.stdout.write(`- ${path.parse(file).name}\n`);
      });
    } else {
      process.stdout.write('Migration : nothing to do\n');
    }
  } else {
    switch (action) {
      case 'list': {
        const current = await db.migrate.currentVersion(config);
        let list = await db.migrate.list(config);
        list = list[0]
          .map((file: any) => path.parse(file.name).name)
          .concat(list[1].map((file: any) => path.parse(file.file).name));
        if (list.length === 0) {
          process.stdout.write('No migration\n');
        } else {
          process.stdout.write('Migrations :\n');
          list.forEach((file: any) => {
            process.stdout.write(`${file.substring(0, 14) === current ? '>' : '-'} ${file}\n`);
          });
        }
        break;
      }
      case 'make': {
        if (name) {
          const file = await db.migrate.make(name, config);
          process.stdout.write('New migration :\n');
          process.stdout.write(`- ${path.parse(file).name}\n`);
        } else {
          throw new Error('Missing migration name');
        }
        break;
      }
      default: {
        throw new Error(`Invalid action "${action}"`);
      }
    }
  }
  await db.destroy();
})();
