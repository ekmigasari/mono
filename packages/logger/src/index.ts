import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

const logger = pino({
	level,
	...((process.env.NODE_ENV === "development" || !process.env.NODE_ENV) && {
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				ignore: "pid,hostname",
			},
		},
	}),
});

export default logger;
export { logError, logErrorAndThrow } from "./error.ts";
