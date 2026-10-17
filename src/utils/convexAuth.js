let tokenProvider = null;

export const setConvexTokenProvider = (provider) => {
    tokenProvider = provider;
};

export const getConvexAuthToken = async () => {
    if (!tokenProvider) return null;
    return tokenProvider({ template: 'convex' });
};
