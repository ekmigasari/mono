import logger from "./index";

type LogLevel = "fatal" | "error" | "warn";

export function logError(
	error: unknown,
	context?: Record<string, unknown>,
	level: LogLevel = "error",
) {
	logger[level]({ err: error, ...context });
}

export function logErrorAndThrow(
	error: unknown,
	context?: Record<string, unknown>,
): never {
	logError(error, context, "fatal");
	throw error instanceof Error ? error : new Error(String(error));
}
