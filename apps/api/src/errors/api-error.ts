import type { ContentfulStatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
	constructor(
		public statusCode: ContentfulStatusCode,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}
