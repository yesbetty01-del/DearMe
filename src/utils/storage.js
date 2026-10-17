import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'dearme.db';
const MIGRATION_KEY = 'migration:async-storage:v1';
const LEGACY_KEYS = ['journals', 'deletedJournals', 'letters', 'deletedLetters', 'onboardingCompleted'];
const BACKUP_MANAGED_KEYS = ['journals', 'deletedJournals', 'letters', 'deletedLetters', 'deletedReflections', 'deletedReplies'];

let databasePromise;

const migrateAsyncStorage = async (database) => {
    const migration = await database.getFirstAsync(
        'SELECT value FROM app_data WHERE key = ?',
        MIGRATION_KEY,
    );
    if (migration) return;

    const legacyValues = await AsyncStorage.multiGet(LEGACY_KEYS);
    await database.withExclusiveTransactionAsync(async (transaction) => {
        for (const [key, value] of legacyValues) {
            if (value !== null) {
                await transaction.runAsync(
                    'INSERT OR IGNORE INTO app_data (key, value) VALUES (?, ?)',
                    key,
                    value,
                );
            }
        }
        await transaction.runAsync(
            'INSERT OR REPLACE INTO app_data (key, value) VALUES (?, ?)',
            MIGRATION_KEY,
            new Date().toISOString(),
        );
    });
};

export const initializeDataLayer = () => {
    if (!databasePromise) {
        databasePromise = (async () => {
            const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
            const { user_version: schemaVersion } = await database.getFirstAsync('PRAGMA user_version');
            if (schemaVersion > 1) throw new Error(`DearMe database version ${schemaVersion} is newer than this app supports.`);
            await database.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS app_data (
                    key TEXT PRIMARY KEY NOT NULL,
                    value TEXT NOT NULL
                );
            `);
            if (schemaVersion === 0) await database.execAsync('PRAGMA user_version = 1;');
            await migrateAsyncStorage(database);
            return database;
        })().catch((error) => {
            databasePromise = undefined;
            throw error;
        });
    }
    return databasePromise;
};

export const getItems = async (key) => {
    try {
        const database = await initializeDataLayer();
        const row = await database.getFirstAsync(
            'SELECT value FROM app_data WHERE key = ?',
            key,
        );
        return row?.value ?? null;
    } catch (error) {
        console.error('Error reading SQLite data:', error);
        throw error;
    }
};

export const setItems = async (key, value) => {
    try {
        await setManyItems([[key, value]]);
        return true;
    } catch (error) {
        console.error('Error writing SQLite data:', error);
        return false;
    }
};

export const setManyItems = async (items) => {
    const database = await initializeDataLayer();
    await database.withExclusiveTransactionAsync(async (transaction) => {
        for (const [key, value] of items) {
            await transaction.runAsync(
                'INSERT OR REPLACE INTO app_data (key, value) VALUES (?, ?)',
                key,
                value,
            );
        }
    });
};

export const replaceLocalData = async (items) => {
    const database = await initializeDataLayer();
    await database.withExclusiveTransactionAsync(async (transaction) => {
        for (const key of BACKUP_MANAGED_KEYS) {
            await transaction.runAsync('DELETE FROM app_data WHERE key = ?', key);
        }
        for (const [key, value] of items) {
            await transaction.runAsync(
                'INSERT INTO app_data (key, value) VALUES (?, ?)',
                key,
                value,
            );
        }
    });
};
