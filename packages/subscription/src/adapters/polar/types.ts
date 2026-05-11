import { z } from "zod";

// --- API request/response types ---

export interface PolarCheckoutCreate {
	product_id: string;
	success_url: string;
	cancel_url: string;
	customer_email?: string;
	customer_name?: string;
	metadata?: Record<string, string>;
}

export interface PolarCheckout {
	id: string;
	url: string | null;
	status: string;
	subscription_id: string | null;
	product_id: string;
	customer_id: string | null;
	created_at: string;
}

export interface PolarProductPriceRecurring {
	type: "recurring";
	id: string;
	price_amount: number;
	price_currency: string;
	recurring_interval: "month" | "year";
}

export interface PolarProduct {
	id: string;
	name: string;
	description: string | null;
	is_archived: boolean;
	prices: PolarProductPriceRecurring[];
	metadata: Record<string, unknown>;
	created_at: string;
}

export interface PolarSubscription {
	id: string;
	status: string;
	current_period_start: string;
	current_period_end: string;
	cancel_at_period_end: boolean;
	trial_end: string | null;
	product_id: string;
	customer_id: string;
	metadata: Record<string, unknown>;
	started_at: string | null;
}

// --- Webhook types ---

export const polarWebhookPayloadSchema = z.object({
	type: z.string(),
	data: z.unknown(),
});

export type PolarWebhookPayload = z.infer<typeof polarWebhookPayloadSchema>;

export const polarCheckoutSchema = z.object({
	id: z.string(),
	url: z.string().nullable(),
	status: z.string(),
	subscription_id: z.string().nullable(),
	product_id: z.string(),
	customer_id: z.string().nullable(),
	created_at: z.string(),
});

export const polarProductSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	is_archived: z.boolean(),
	prices: z.array(
		z.object({
			type: z.literal("recurring"),
			id: z.string(),
			price_amount: z.number(),
			price_currency: z.string(),
			recurring_interval: z.enum(["month", "year"]),
		}),
	),
	metadata: z.record(z.unknown()),
	created_at: z.string(),
});

export const polarSubscriptionSchema = z.object({
	id: z.string(),
	status: z.string(),
	current_period_start: z.string(),
	current_period_end: z.string(),
	cancel_at_period_end: z.boolean(),
	trial_end: z.string().nullable(),
	product_id: z.string(),
	customer_id: z.string(),
	metadata: z.record(z.unknown()),
	started_at: z.string().nullable(),
});
