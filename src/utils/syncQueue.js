let syncHandler = null;
let activeSync = null;

export const setSyncHandler = (handler) => {
    syncHandler = handler;
};

export const syncNow = async () => {
    if (!syncHandler) throw new Error('Sign in to sync your DearMe data.');
    if (activeSync) return activeSync;

    activeSync = Promise.resolve().then(() => syncHandler());
    try {
        await activeSync;
    } finally {
        activeSync = null;
    }
};
