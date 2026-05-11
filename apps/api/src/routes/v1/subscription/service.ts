import type { SubscriptionPlan } from "@monorepo/subscription";
import { createSubscriptionProvider } from "@monorepo/subscription";
import { env } from "@monorepo/types/server";
import type { User } from "../../../lib/auth";

const sub = createSubscriptionProvider("polar");

export type SubscriptionRecord = {
	id: string;
	userId: string;
	planId: string;
	status: string;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	provider: string;
	providerSubscriptionId: string;
	trialEnd: string | null;
	createdAt: string;
	updatedAt: string;
};

export async function listPlans(): Promise<{ plans: SubscriptionPlan[] }> {
	const plans = await sub.listPlans();
	return { plans };
}

export async function getCurrentSubscription(user: User) {
	const subscription = await sub.getSubscription(user.id);
	return { subscription };
}

export async function createCheckoutSession(
	user: User,
	body: { planId: string },
) {
	if (!body.planId) {
		throw new Error("planId is required");
	}

	const checkout = await sub.createCheckoutSession({
		userId: user.id,
		userEmail: user.email,
		userName: user.name,
		providerPlanId: body.planId,
		successUrl: `${env.VITE_APP_URL}/dashboard`,
		cancelUrl: `${env.VITE_APP_URL}/plans`,
	});

	return { url: checkout.url };
}

export async function cancelUserSubscription(user: User) {
	await sub.cancelSubscription(user.id);
	return { success: true };
}

export async function handleWebhook(
	payload: unknown,
	headers: Record<string, string>,
) {
	await sub.handleWebhook(payload, headers);
	return { received: true };
}
