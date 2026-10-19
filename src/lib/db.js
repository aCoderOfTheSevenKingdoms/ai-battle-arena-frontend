/**
 * IndexedDB access for AI Battle Arena — the only module allowed to touch IndexedDB.
 * Database `ai-battle-arena`, store `battles` (key path `id`, index `createdAt`).
 * Every call is guarded: when IndexedDB is unavailable (private mode, blocked
 * storage) a `DbUnavailableError` is thrown so callers can fall back to memory.
 * @module lib/db
 */

import { openDB } from 'idb'

/** Database name required by PROJECT_SCOPE section 6.2. */
const DB_NAME = 'ai-battle-arena'

/** Object store holding completed battles. */
const STORE = 'battles'

/** Indexed field used for newest-first sorting. */
const INDEX = 'createdAt'

/** @type {Promise<IDBPDatabase<unknown>> | null} */
let dbPromise = null

/** Thrown when IndexedDB cannot be used; callers fall back to in-memory state. */
export class DbUnavailableError extends Error {
  constructor(message = 'IndexedDB is unavailable in this browser context.') {
    super(message)
    this.name = 'DbUnavailableError'
  }
}

/**
 * Open (and memoize) the database handle.
 * @returns {Promise<IDBPDatabase<unknown>>}
 * @throws {DbUnavailableError}
 */
function getDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new DbUnavailableError())
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex(INDEX, INDEX)
      },
    }).catch((error) => {
      dbPromise = null // allow a retry on the next call
      throw new DbUnavailableError(`Could not open the arena database: ${error.message}`)
    })
  }
  return dbPromise
}

/**
 * All stored battles, newest first.
 * @returns {Promise<import('./types.js').Battle[]>}
 * @throws {DbUnavailableError}
 */
export async function getBattles() {
  try {
    const db = await getDb()
    const battles = await db.getAll(STORE)
    return battles.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    if (error instanceof DbUnavailableError) throw error
    throw new DbUnavailableError(`Could not read battles: ${error.message}`)
  }
}

/**
 * Persist one completed battle.
 * @param {import('./types.js').Battle} battle
 * @returns {Promise<void>}
 * @throws {DbUnavailableError}
 */
export async function saveBattle(battle) {
  try {
    const db = await getDb()
    await db.put(STORE, battle)
  } catch (error) {
    if (error instanceof DbUnavailableError) throw error
    throw new DbUnavailableError(`Could not save the battle: ${error.message}`)
  }
}

/**
 * Delete a single battle by id.
 * @param {string} id
 * @returns {Promise<void>}
 * @throws {DbUnavailableError}
 */
export async function deleteBattle(id) {
  try {
    const db = await getDb()
    await db.delete(STORE, id)
  } catch (error) {
    if (error instanceof DbUnavailableError) throw error
    throw new DbUnavailableError(`Could not delete the battle: ${error.message}`)
  }
}

/**
 * Wipe the whole store — used for fresh sessions and "Clear all".
 * @returns {Promise<void>}
 * @throws {DbUnavailableError}
 */
export async function clearBattles() {
  try {
    const db = await getDb()
    await db.clear(STORE)
  } catch (error) {
    if (error instanceof DbUnavailableError) throw error
    throw new DbUnavailableError(`Could not clear battles: ${error.message}`)
  }
}
