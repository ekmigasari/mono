export class SubscriptionError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly provider?: string,
	) {
		super(message);
		this.name = "SubscriptionError";
	}
}

export class ProviderError extends SubscriptionError {
	constructor(
		message: string,
		provider: string,
		public readonly statusCode?: number,
	) {
		super(message, "PROVIDER_ERROR", provider);
		this.name = "ProviderError";
	}
}

export class WebhookError extends SubscriptionError {
	constructor(message: string, provider: string) {
		super(message, "WEBHOOK_ERROR", provider);
		this.name = "WebhookError";
	}
}

export class PlanNotFoundError extends SubscriptionError {
	constructor(planId: string) {
		super(`Plan not found: ${planId}`, "PLAN_NOT_FOUND");
		this.name = "PlanNotFoundError";
	}
}
