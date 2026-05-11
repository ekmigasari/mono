import { auth } from "@monorepo/auth/server";
import { Hono } from "hono";
import { corsMiddleware } from "../middleware/cors";

export const authRoutes = new Hono();

authRoutes.use("/*", corsMiddleware);

authRoutes.on(["POST", "GET"], "/*", (c) => {
	return auth.handler(c.req.raw);
});
