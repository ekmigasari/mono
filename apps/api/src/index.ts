import { serve } from "@hono/node-server";
import { auth } from "@monorepo/auth/server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
	"/api/auth/*",
	cors({
		origin: ["http://localhost:5173", "http://localhost:5174"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

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
