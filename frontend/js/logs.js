const DEBUG = true;

function createLogger(scope = "APP") {
    return {
        info: (msg, data) =>
            DEBUG && console.log(`ℹ️ [${scope}] ${msg}`, data || ""),
        success: (msg, data) =>
            DEBUG && console.log(`✅ [${scope}] ${msg}`, data || ""),
        warn: (msg, data) =>
            DEBUG && console.warn(`⚠️ [${scope}] ${msg}`, data || ""),
        error: (msg, err) =>
            console.error(`❌ [${scope}] ${msg}`, err || "")
    };
}

export const log = createLogger();
export { createLogger };
