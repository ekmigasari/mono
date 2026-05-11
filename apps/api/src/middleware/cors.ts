import { env } from "@monorepo/types/server";
import { cors } from "hono/cors";

export const corsConfig = {
	origin: ["http://localhost:3000", "http://localhost:4000", env.VITE_APP_URL],
	allowHeaders: ["Content-Type", "Authorization"],
	allowMethods: ["POST", "GET", "OPTIONS"],
	exposeHeaders: ["Content-Length"],
	maxAge: 600,
	credentials: true,
};

export const corsMiddleware = cors(corsConfig);
