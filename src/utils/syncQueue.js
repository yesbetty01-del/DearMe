let syncHandler = null;
let scheduled = false;
let activeSync = null;
let rerunRequested = false;
let retryTimer = null;
let retryDelay = 5000;

const scheduleRetry = () => {
    if (!syncHandler || retryTimer) return;
    retryTimer = setTimeout(() => {
        retryTimer = null;
        requestSync();
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 15 * 60 * 1000);
};

export const setSyncHandler = (handler) => {
    syncHandler = handler;
    if (handler) {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = null;
        retryDelay = 5000;
        requestSync();
    } else {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = null;
        retryDelay = 5000;
        rerunRequested = false;
    }
};

export const requestSync = () => {
    if (!syncHandler) return;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
    if (activeSync) {
        rerunRequested = true;
        return;
    }
    if (scheduled) return;
    scheduled = true;
    Promise.resolve().then(async () => {
        scheduled = false;
        if (activeSync) return;
        activeSync = syncHandler();
        try {
            await activeSync;
            retryDelay = 5000;
        } catch (error) {
            console.warn('Could not sync local data:', error);
            scheduleRetry();
        } finally {
            activeSync = null;
            if (rerunRequested) {
                rerunRequested = false;
                requestSync();
            }
        }
    });
};
