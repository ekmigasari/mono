import { PolarAdapter } from "./adapters/polar/index";
import {
	PlanNotFoundError,
	ProviderError,
	SubscriptionError,
	WebhookError,
} from "./errors";
import { SubscriptionService } from "./service";
import type { SubscriptionProviderName } from "./types";

export type { SubscriptionAdapter } from "./adapters/interface";
export type {
	BillingInterval,
	CheckoutInput,
	CheckoutSession,
	ProviderSubscription,
	SubscriptionCustomer,
	SubscriptionPlan,
	SubscriptionProviderName,
	SubscriptionRecord,
	SubscriptionStatus,
	WebhookEvent,
} from "./types";
export {
	PlanNotFoundError,
	PolarAdapter,
	ProviderError,
	SubscriptionError,
	SubscriptionService,
	WebhookError,
};

export function createSubscriptionProvider(
	provider: SubscriptionProviderName,
): SubscriptionService {
	switch (provider) {
		case "polar": {
			const adapter = new PolarAdapter();
			return new SubscriptionService(adapter);
		}
		default: {
			throw new SubscriptionError(
				`Unsupported subscription provider: ${provider}`,
				"UNSUPPORTED_PROVIDER",
			);
		}
	}
}
