import { auth } from "@monorepo/auth/server";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { ApiError } from "../errors/api-error";

export type User = {
	id: string;
	email: string;
	name: string;
};

export type AppVariables = {
	user: User;
};

export const requireAuth = createMiddleware<{ Variables: AppVariables }>(
	async (c, next) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});
		if (!session?.user) {
			throw new ApiError(401, "Unauthorized");
		}
		c.set("user", session.user as User);
		await next();
	},
);

export async function getSessionUser(c: Context) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session?.user) {
		throw new ApiError(401, "Unauthorized");
	}
	return session.user as User;
}
