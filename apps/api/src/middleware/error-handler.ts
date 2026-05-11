import { logError } from "@monorepo/logger";
import type { ErrorHandler } from "hono";
import { ApiError } from "../errors/api-error";

export const errorHandler: ErrorHandler = (err, c) => {
	logError(err, { path: c.req.path, method: c.req.method });

	if (err instanceof ApiError) {
		return c.json({ error: err.message }, err.statusCode);
	}

	return c.json({ error: "Internal Server Error" }, 500);
};
