import { serve } from "@hono/node-server";
import { auth } from "@monorepo/auth/server";
import { logError } from "@monorepo/logger";
import { env } from "@monorepo/types/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ApiError } from "./errors/api-error";

const app = new Hono();

app.use(
	"/api/auth/*",
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:4000",
			env.VITE_APP_URL,
		],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.onError((err, c) => {
	logError(err, { path: c.req.path, method: c.req.method });
	if (err instanceof ApiError) {
		return c.json({ error: err.message }, err.statusCode);
	}
	return c.json({ error: "Internal Server Error" }, 500);
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
