// Production domain for Turnstile hostname check: stormproroofing.ca

const ALLOWED_HOSTNAMES = [
    "blue-hat-0f19.dev-smika04.workers.dev",
    "stormproroofing.ca",
    "www.stormproroofing.ca",
    "localhost",
    "127.0.0.1"
];

const ALLOWED_ORIGINS = [
    "https://blue-hat-0f19.dev-smika04.workers.dev",
    "https://stormproroofing.ca",
    "https://www.stormproroofing.ca",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5500"
];

const RATE_LIMIT_CONFIG = {
    maxSubmissions: 10,
    windowSeconds: 60 * 60,
    keyPrefix: "form-submit"
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            return handleCorsPreflightRequest(request);
        }

        if (url.pathname === "/api/verify-turnstile") {
            if (request.method !== "POST") {
                return jsonResponse(
                    request,
                    {
                        success: false,
                        limited: false,
                        message: "Method not allowed"
                    },
                    405
                );
            }

            return handleTurnstileVerification(request, env);
        }

        return jsonResponse(
            request,
            {
                success: true,
                message: "Storm Pro Roofing API is running!",
                hasTurnstileSecret: Boolean(env.TURNSTILE_SECRET),
                hasRateLimitBinding: Boolean(env.FORM_RATE_LIMIT)
            }
        );
    }
};

function getCorsHeaders(request) {
    const origin = request.headers.get("Origin") || "";

    const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[0];

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
    };
}

function handleCorsPreflightRequest(request) {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request)
    });
}

function jsonResponse(request, data, status = 200, extraHeaders = {}) {
    return Response.json(data, {
        status,
        headers: {
            ...getCorsHeaders(request),
            ...extraHeaders
        }
    });
}

function getClientIp(request) {
    return request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
        "unknown";
}

async function getRateLimitState(request, env) {
    if (!env.FORM_RATE_LIMIT) {
        return {
            allowed: true,
            count: 0,
            resetAt: 0,
            retryAfterSeconds: 0,
            key: "",
            hasBinding: false
        };
    }

    const ip = getClientIp(request);
    const key = `${RATE_LIMIT_CONFIG.keyPrefix}:${ip}`;
    const now = Math.floor(Date.now() / 1000);

    const currentValue = await env.FORM_RATE_LIMIT.get(key, "json");

    if (!currentValue || now >= currentValue.resetAt) {
        return {
            allowed: true,
            count: 0,
            resetAt: now + RATE_LIMIT_CONFIG.windowSeconds,
            retryAfterSeconds: 0,
            key,
            hasBinding: true
        };
    }

    if (currentValue.count >= RATE_LIMIT_CONFIG.maxSubmissions) {
        return {
            allowed: false,
            count: currentValue.count,
            resetAt: currentValue.resetAt,
            retryAfterSeconds: Math.max(currentValue.resetAt - now, 0),
            key,
            hasBinding: true
        };
    }

    return {
        allowed: true,
        count: currentValue.count,
        resetAt: currentValue.resetAt,
        retryAfterSeconds: 0,
        key,
        hasBinding: true
    };
}

async function incrementRateLimit(state, env) {
    if (!state.hasBinding || !state.key) {
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const expirationTtl = Math.max(state.resetAt - now, 60);

    await env.FORM_RATE_LIMIT.put(
        state.key,
        JSON.stringify({
            count: state.count + 1,
            resetAt: state.resetAt
        }),
        {
            expirationTtl
        }
    );
}

async function handleTurnstileVerification(request, env) {
    try {
        const { token } = await request.json();

        if (
            typeof token !== "string" ||
            token.length === 0 ||
            token.length > 2048
        ) {
            return jsonResponse(
                request,
                {
                    success: false,
                    limited: false,
                    message: "Missing or invalid captcha token"
                },
                400
            );
        }

        const captchaResult = await verifyTurnstileToken(request, env, token);

        if (!captchaResult.success) {
            return jsonResponse(
                request,
                {
                    success: false,
                    limited: false,
                    message: "Captcha verification failed. Please try again.",
                    hostname: captchaResult.hostname,
                    hostnameAllowed: captchaResult.hostnameAllowed,
                    errorCodes: captchaResult.errorCodes
                },
                403
            );
        }

        const rateLimit = await getRateLimitState(request, env);

        if (!rateLimit.allowed) {
            return jsonResponse(
                request,
                {
                    success: false,
                    limited: true,
                    message: "Too many form submissions. Please try again later.",
                    retryAfterSeconds: rateLimit.retryAfterSeconds
                },
                429,
                {
                    "Retry-After": String(rateLimit.retryAfterSeconds)
                }
            );
        }

        await incrementRateLimit(rateLimit, env);

        return jsonResponse(
            request,
            {
                success: true,
                limited: false,
                message: "Captcha verified successfully.",
                remainingSubmissions: Math.max(
                    RATE_LIMIT_CONFIG.maxSubmissions - rateLimit.count - 1,
                    0
                ),
                resetAt: rateLimit.resetAt,
                hasRateLimitBinding: rateLimit.hasBinding
            },
            200
        );

    } catch {
        return jsonResponse(
            request,
            {
                success: false,
                limited: false,
                message: "Invalid verification request"
            },
            400
        );
    }
}

async function verifyTurnstileToken(request, env, token) {
    if (!env.TURNSTILE_SECRET) {
        return {
            success: false,
            hostname: "",
            hostnameAllowed: false,
            errorCodes: ["missing-input-secret"]
        };
    }

    const formData = new FormData();

    formData.append("secret", env.TURNSTILE_SECRET);
    formData.append("response", token);

    const clientIp = request.headers.get("CF-Connecting-IP");

    if (clientIp) {
        formData.append("remoteip", clientIp);
    }

    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        return {
            success: false,
            hostname: "",
            hostnameAllowed: false,
            errorCodes: ["siteverify-request-failed"]
        };
    }

    const result = await response.json();
    const hostname = result.hostname || "";
    const hostnameAllowed = ALLOWED_HOSTNAMES.includes(hostname);

    return {
        success: result.success === true && hostnameAllowed,
        hostname,
        hostnameAllowed,
        errorCodes: result["error-codes"] || []
    };
}