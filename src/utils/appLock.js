import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const APP_LOCK_KEY = 'dearme.app-lock.v1';

export const getAppLock = async () => {
    const value = await SecureStore.getItemAsync(APP_LOCK_KEY);
    return value ? JSON.parse(value) : null;
};

export const saveAppLock = async (method, credential) => {
    if (method === 'Biometrics') {
        await SecureStore.setItemAsync(APP_LOCK_KEY, JSON.stringify({ method }));
        return;
    }

    const salt = Array.from(
        Crypto.getRandomBytes(16),
        (byte) => byte.toString(16).padStart(2, '0'),
    ).join('');
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${credential}`);
    await SecureStore.setItemAsync(APP_LOCK_KEY, JSON.stringify({ method, salt, hash }));
};

export const verifyAppLock = async (credential) => {
    const lock = await getAppLock();
    if (!lock?.salt || !lock?.hash) return false;
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${lock.salt}:${credential}`);
    return hash === lock.hash;
};

export const clearAppLock = () => SecureStore.deleteItemAsync(APP_LOCK_KEY);
