/**
 * Rewarded ad boundary. An AdMob adapter can be registered here later.
 * Providers resolve with { status: 'rewarded' } only after their reward callback fires.
 */
let rewardedAdProvider = null;

export const configureRewardedAdProvider = (provider) => {
    if (provider !== null && typeof provider?.showRewardedAd !== 'function') {
        throw new TypeError('Rewarded ad provider must implement showRewardedAd().');
    }
    rewardedAdProvider = provider;
};

export const showRewardedAd = async ({ placementId }) => {
    if (!rewardedAdProvider) return { status: 'unavailable' };
    try {
        const result = await rewardedAdProvider.showRewardedAd({ placementId });
        return result?.status === 'rewarded' ? { status: 'rewarded' } : { status: result?.status || 'failed' };
    } catch (error) {
        console.warn('Rewarded ad could not be shown:', error);
        return { status: 'failed' };
    }
};
