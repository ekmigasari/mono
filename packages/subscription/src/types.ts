export type SubscriptionStatus =
	| "active"
	| "canceled"
	| "incomplete"
	| "incomplete_expired"
	| "past_due"
	| "paused"
	| "trialing"
	| "unpaid";

export type BillingInterval = "month" | "year";

export type SubscriptionProviderName = "polar" | "stripe" | "xendit";

export interface SubscriptionPlan {
	id: string;
	name: string;
	description: string | null;
	price: number;
	currency: string;
	interval: BillingInterval;
	trialDays: number;
	providerPlanId: string;
	active: boolean;
}

export interface SubscriptionCustomer {
	id: string;
	userId: string;
	email: string;
	name: string | null;
	provider: SubscriptionProviderName;
	providerCustomerId: string | null;
}

export interface CheckoutInput {
	userId: string;
	userEmail: string;
	userName: string | null;
	providerPlanId: string;
	successUrl: string;
	cancelUrl: string;
	metadata?: Record<string, string>;
}

export interface CheckoutSession {
	id: string;
	url: string | null;
	status: SubscriptionStatus;
	customerId: string;
	providerPlanId: string;
	subscriptionId: string | null;
}

export interface SubscriptionRecord {
	id: string;
	userId: string;
	planId: string;
	status: SubscriptionStatus;
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	cancelAtPeriodEnd: boolean;
	provider: SubscriptionProviderName;
	providerSubscriptionId: string;
	providerCustomerId: string | null;
	metadata: Record<string, unknown>;
	trialEnd: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface WebhookEvent {
	provider: SubscriptionProviderName;
	type: string;
	data: unknown;
	raw: unknown;
}

export interface ProviderSubscription {
	id: string;
	status: SubscriptionStatus;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	trialEnd: string | null;
	metadata: Record<string, unknown>;
	planId: string;
}
