import { Hono } from "hono";
import { requireAuth } from "../../../lib/auth";
import * as subscriptionService from "./service";

export const subscriptionRoutes = new Hono();

subscriptionRoutes.get("/plans", async (c) => {
	const result = await subscriptionService.listPlans();
	return c.json(result);
});

subscriptionRoutes.get("/current", requireAuth, async (c) => {
	const user = c.var.user;
	const result = await subscriptionService.getCurrentSubscription(user);
	return c.json(result);
});

subscriptionRoutes.post("/checkout", requireAuth, async (c) => {
	const user = c.var.user;
	const body = await c.req.json();
	const result = await subscriptionService.createCheckoutSession(user, body);
	return c.json(result);
});

subscriptionRoutes.post("/cancel", requireAuth, async (c) => {
	const user = c.var.user;
	const result = await subscriptionService.cancelUserSubscription(user);
	return c.json(result);
});

subscriptionRoutes.post("/webhook", async (c) => {
	const payload = await c.req.json();
	const headers: Record<string, string> = {};
	for (const [key, value] of c.req.raw.headers.entries()) {
		headers[key] = value;
	}
	const result = await subscriptionService.handleWebhook(payload, headers);
	return c.json(result);
});
