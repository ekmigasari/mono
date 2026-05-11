import { env } from "@monorepo/types/server";
import pino from "pino";

const logger = pino({
	level: env.LOG_LEVEL,
	...(env.NODE_ENV === "development" && {
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
export { logError, logErrorAndThrow } from "./error.js";
