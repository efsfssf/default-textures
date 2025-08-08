import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { chunkKeyToString } from '../core/Types';
import type { ChunkKey } from '../core/Types';

interface VoxelandDB extends DBSchema {
  worlds: {
    key: string; // worldId
    value: { id: string; name: string; seed: string; createdAt: number; generatorVersion: number };
  };
  chunks: {
    key: string; // worldId:cx:cz
    value: { key: ChunkKey; voxels: ArrayBuffer; light: ArrayBuffer; version: number };
  };
}

let dbPromise: Promise<IDBPDatabase<VoxelandDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VoxelandDB>('voxeland-db', 1, {
      upgrade(db) {
        db.createObjectStore('worlds');
        db.createObjectStore('chunks');
      },
    });
  }
  return dbPromise;
}

export async function putWorld(meta: VoxelandDB['worlds']['value']) {
  const db = await getDB();
  await db.put('worlds', meta, meta.id);
}

export async function getWorld(id: string) {
  const db = await getDB();
  return db.get('worlds', id);
}

export async function listWorlds() {
  const db = await getDB();
  const tx = db.transaction('worlds');
  const store = tx.store;
  const all: VoxelandDB['worlds']['value'][] = [];
  let cursor = await store.openCursor();
  while (cursor) {
    all.push(cursor.value);
    cursor = await cursor.continue();
  }
  await tx.done;
  return all;
}

export async function deleteWorld(id: string) {
  const db = await getDB();
  await db.delete('worlds', id);
  const tx = db.transaction('chunks', 'readwrite');
  const store = tx.store;
  let cursor = await store.openCursor();
  while (cursor) {
    if (cursor.key.startsWith(id + ':')) await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function putChunk(data: VoxelandDB['chunks']['value']) {
  const db = await getDB();
  await db.put('chunks', data, chunkKeyToString(data.key));
}

export async function getChunk(key: ChunkKey) {
  const db = await getDB();
  return db.get('chunks', chunkKeyToString(key));
}