import type {
	CheckoutInput,
	CheckoutSession,
	ProviderSubscription,
	SubscriptionPlan,
	SubscriptionProviderName,
	WebhookEvent,
} from "../types";

export interface SubscriptionAdapter {
	readonly name: SubscriptionProviderName;

	createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession>;

	handleWebhook(
		payload: unknown,
		headers: Record<string, string>,
	): Promise<WebhookEvent>;

	cancelSubscription(providerSubscriptionId: string): Promise<void>;

	getSubscription(
		providerSubscriptionId: string,
	): Promise<ProviderSubscription>;

	listPlans(): Promise<SubscriptionPlan[]>;

	getPlan(providerPlanId: string): Promise<SubscriptionPlan | null>;
}
