import { env } from "@monorepo/types/server";
import { ProviderError, WebhookError } from "../../errors";
import type {
	CheckoutInput,
	CheckoutSession,
	ProviderSubscription,
	SubscriptionPlan,
	SubscriptionProviderName,
	WebhookEvent,
} from "../../types";
import type { SubscriptionAdapter } from "../interface";
import {
	type PolarCheckout,
	type PolarCheckoutCreate,
	type PolarProduct,
	type PolarSubscription,
	type PolarWebhookPayload,
	polarWebhookPayloadSchema,
} from "./types";

const POLAR_API = "https://api.polar.sh/v1";

function polarFetch(path: string, init?: RequestInit) {
	const token = env.POLAR_ACCESS_TOKEN;
	return fetch(`${POLAR_API}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			...init?.headers,
		},
	});
}

async function polarFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await polarFetch(path, init);
	if (!response.ok) {
		const text = await response.text().catch(() => "unknown");
		throw new ProviderError(
			`Polar API error: ${response.status} ${text}`,
			"polar",
			response.status,
		);
	}
	return response.json() as Promise<T>;
}

function toSubscriptionPlan(product: PolarProduct): SubscriptionPlan {
	const recurring = product.prices.find((p) => p.type === "recurring");

	if (!recurring || recurring.type !== "recurring") {
		throw new ProviderError(
			`Product ${product.id} has no recurring price`,
			"polar",
		);
	}

	return {
		id: product.id,
		name: product.name,
		description: product.description,
		price: recurring.price_amount,
		currency: recurring.price_currency.toLowerCase(),
		interval: recurring.recurring_interval === "year" ? "year" : "month",
		trialDays: (product.metadata as Record<string, string> | undefined)
			?.trial_days
			? Number((product.metadata as Record<string, string>).trial_days)
			: 0,
		providerPlanId: product.id,
		active: product.is_archived === false,
	};
}

function toCheckoutSession(
	checkout: PolarCheckout,
	userId: string,
	providerPlanId: string,
): CheckoutSession {
	return {
		id: checkout.id,
		url: checkout.url,
		status: checkout.status as CheckoutSession["status"],
		customerId: userId,
		providerPlanId,
		subscriptionId: checkout.subscription_id ?? null,
	};
}

interface PolarListResponse<T> {
	items: T[];
	pagination: {
		total_count?: number;
		next_page?: string | null;
	};
}

export class PolarAdapter implements SubscriptionAdapter {
	readonly name: SubscriptionProviderName = "polar";
	private readonly webhookSecret: string;

	constructor() {
		this.webhookSecret = env.POLAR_WEBHOOK_SECRET;
	}

	async createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
		const body: PolarCheckoutCreate = {
			product_id: input.providerPlanId,
			success_url: input.successUrl,
			cancel_url: input.cancelUrl,
			customer_email: input.userEmail,
			...(input.userName && { customer_name: input.userName }),
			metadata: {
				user_id: input.userId,
				...input.metadata,
			},
		};

		const checkout = await polarFetchJson<PolarCheckout>("/checkouts/custom/", {
			method: "POST",
			body: JSON.stringify(body),
		});

		return toCheckoutSession(checkout, input.userId, input.providerPlanId);
	}

	async handleWebhook(
		payload: unknown,
		headers: Record<string, string>,
	): Promise<WebhookEvent> {
		const signature = headers["webhook-id"] ?? headers["Webhook-Id"];
		const timestamp =
			headers["webhook-timestamp"] ?? headers["Webhook-Timestamp"];
		const sigHeader =
			headers["webhook-signature"] ?? headers["Webhook-Signature"];

		if (!signature || !timestamp || !sigHeader) {
			throw new WebhookError("Missing webhook headers", "polar");
		}

		const signedContent = `${signature}.${timestamp}.${JSON.stringify(payload)}`;
		const expectedSig = await this.signHmac(signedContent);

		const receivedSigs = (sigHeader as string).split(" ").map((s) => s.trim());
		if (!receivedSigs.includes(expectedSig)) {
			throw new WebhookError("Invalid webhook signature", "polar");
		}

		const result = polarWebhookPayloadSchema.safeParse(payload);
		if (!result.success) {
			throw new WebhookError(
				`Invalid webhook payload: ${result.error.message}`,
				"polar",
			);
		}

		const event = result.data as PolarWebhookPayload;

		return {
			provider: "polar",
			type: event.type,
			data: event.data,
			raw: payload,
		};
	}

	async cancelSubscription(providerSubscriptionId: string): Promise<void> {
		await polarFetchJson(`/subscriptions/${providerSubscriptionId}`, {
			method: "DELETE",
		});
	}

	async getSubscription(
		providerSubscriptionId: string,
	): Promise<ProviderSubscription> {
		const sub = await polarFetchJson<PolarSubscription>(
			`/subscriptions/${providerSubscriptionId}`,
		);

		return {
			id: sub.id,
			status: sub.status as ProviderSubscription["status"],
			currentPeriodStart: sub.current_period_start,
			currentPeriodEnd: sub.current_period_end,
			cancelAtPeriodEnd: sub.cancel_at_period_end,
			trialEnd: sub.trial_end ?? null,
			metadata: sub.metadata as Record<string, unknown>,
			planId: sub.product_id,
		};
	}

	async listPlans(): Promise<SubscriptionPlan[]> {
		const response = await polarFetchJson<PolarListResponse<PolarProduct>>(
			"/products/?is_recurring=true",
		);

		return response.items.map(toSubscriptionPlan);
	}

	async getPlan(providerPlanId: string): Promise<SubscriptionPlan | null> {
		try {
			const product = await polarFetchJson<PolarProduct>(
				`/products/${providerPlanId}`,
			);
			return toSubscriptionPlan(product);
		} catch (error) {
			if (error instanceof ProviderError && error.statusCode === 404) {
				return null;
			}
			throw error;
		}
	}

	private async signHmac(content: string): Promise<string> {
		const encoder = new TextEncoder();
		const key = await crypto.subtle.importKey(
			"raw",
			encoder.encode(this.webhookSecret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		);
		const signature = await crypto.subtle.sign(
			"HMAC",
			key,
			encoder.encode(content),
		);
		const hex = Array.from(new Uint8Array(signature))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		return `v1,${hex}`;
	}
}
