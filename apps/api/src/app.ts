import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { authRoutes } from "./routes/auth";
import { subscriptionRoutes } from "./routes/v1/subscription/index";

export function createApp() {
	const app = new Hono();

	app.use("/api/auth/*", corsMiddleware);
	app.use("/api/v1/*", corsMiddleware);

	app.onError(errorHandler);

	app.route("/api/auth", authRoutes);
	app.route("/api/v1/subscription", subscriptionRoutes);

	app.get("/", (c) => c.text("Hello Hono!"));

	return app;
}
