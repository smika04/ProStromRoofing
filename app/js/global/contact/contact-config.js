// Production domain for Turnstile hostname check: stormproroofing.ca

export const CONTACT_FORM_CONFIG = {
    turnstileVerifyUrl: 'https://form-check.dev-smika04.workers.dev/api/verify-turnstile',
    turnstileSiteKey: '0x4AAAAAAFtcvnGHso2Ef6w8',
    successMessage: 'Thank you! Your request has been received.',
    captchaLoadingMessage: 'Human check is loading. Please wait a few seconds and try again.',
    captchaRequiredMessage: 'Human check is not ready yet. Please wait a few seconds and try again.',
    captchaFailedMessage: 'Captcha verification failed. Please try again.',
    captchaUnavailableMessage: 'Captcha verification is unavailable. Please try again later.',
    rateLimitMessage: 'Too many form submissions. Please try again later.'
};
