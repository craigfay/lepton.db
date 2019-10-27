// USAGE:
// const data = database('/data');

// data.commit(
//   data.define('actors', {
//     cash: data.num,
//   }),
//   data.define('positions', {
//     cash: data.num,
//     actorId: data.ref('actors'),
//     symbol: data.str,
//     quantity: data.int
//   }),
//   data.define('transactions', {
//     actorId: data.ref('actors'),
//     timestamp: data.iso,
//     action: data.enum('buy', 'sell'),
//     symbol: data.str,
//     quantity: data.int,
//     price: data.num,
//   }),
// )

import {
  Commit,
  CommitMaterial,
  FileManager,
  ReadOnlyDatabase
} from './entities';
import { fileManager } from './file-manager';

export async function database(dirpath) {
  const fm = fileManager(dirpath)
  const data = await fm.rebuild();
  if (data instanceof Error) throw data;

  return {
    define,
    commit: makeCommiter(fm, data),
    read: (table:string) => data[table],
  }
}

function define(table, fields): CommitMaterial {
  return { table, mutation: 'define', payload: fields }
}

function makeCommiter(fm:FileManager, data:ReadOnlyDatabase) {
  return async function(cm:CommitMaterial): Promise<Error|Commit> {
    const commit = await fm.commit(cm);
    if (commit instanceof Error) return commit;

    if (cm.mutation == 'define') {
      data[cm.table] = {};
    }

    if (cm.mutation == 'create') {
      const { id, ...fields } = cm.payload;
      data[cm.table][id] = fields;
    }
  }
}