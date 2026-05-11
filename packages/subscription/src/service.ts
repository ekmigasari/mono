import { prisma } from "@monorepo/db";
import logger from "@monorepo/logger";
import type { SubscriptionAdapter } from "./adapters/interface";
import { SubscriptionError } from "./errors";
import type {
	CheckoutInput,
	CheckoutSession,
	SubscriptionPlan,
	SubscriptionRecord,
	SubscriptionStatus,
	WebhookEvent,
} from "./types";

function toRecord(dbSub: {
	id: string;
	userId: string;
	planId: string;
	status: string;
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	cancelAtPeriodEnd: boolean;
	provider: string;
	providerSubscriptionId: string;
	providerCustomerId: string | null;
	metadata: unknown;
	trialEnd: Date | null;
	createdAt: Date;
	updatedAt: Date;
}): SubscriptionRecord {
	return {
		id: dbSub.id,
		userId: dbSub.userId,
		planId: dbSub.planId,
		status: dbSub.status as SubscriptionStatus,
		currentPeriodStart: dbSub.currentPeriodStart,
		currentPeriodEnd: dbSub.currentPeriodEnd,
		cancelAtPeriodEnd: dbSub.cancelAtPeriodEnd,
		provider: dbSub.provider as SubscriptionRecord["provider"],
		providerSubscriptionId: dbSub.providerSubscriptionId,
		providerCustomerId: dbSub.providerCustomerId,
		metadata: (dbSub.metadata ?? {}) as Record<string, unknown>,
		trialEnd: dbSub.trialEnd,
		createdAt: dbSub.createdAt,
		updatedAt: dbSub.updatedAt,
	};
}

export class SubscriptionService {
	constructor(private readonly adapter: SubscriptionAdapter) {}

	get provider(): SubscriptionAdapter {
		return this.adapter;
	}

	async createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
		logger.info(
			{ userId: input.userId, planId: input.providerPlanId },
			"Creating checkout session",
		);

		const session = await this.adapter.createCheckoutSession(input);

		await prisma.subscription.upsert({
			where: {
				userId_provider: {
					userId: input.userId,
					provider: this.adapter.name,
				},
			},
			update: {
				providerSubscriptionId: session.subscriptionId ?? "",
				status: session.status,
				planId: session.providerPlanId,
			},
			create: {
				userId: input.userId,
				planId: session.providerPlanId,
				status: session.status,
				provider: this.adapter.name,
				providerSubscriptionId: session.subscriptionId ?? "",
				currentPeriodStart: new Date(),
				currentPeriodEnd: new Date(),
			},
		});

		return session;
	}

	async handleWebhook(
		payload: unknown,
		headers: Record<string, string>,
	): Promise<WebhookEvent> {
		const event = await this.adapter.handleWebhook(payload, headers);

		logger.info(
			{ type: event.type, provider: event.provider },
			"Processing webhook event",
		);

		await this.processWebhookEvent(event);

		return event;
	}

	async cancelSubscription(userId: string): Promise<void> {
		const sub = await prisma.subscription.findFirst({
			where: { userId, provider: this.adapter.name },
		});

		if (!sub) {
			throw new SubscriptionError("No active subscription found", "NOT_FOUND");
		}

		if (sub.providerSubscriptionId) {
			await this.adapter.cancelSubscription(sub.providerSubscriptionId);
		}

		await prisma.subscription.update({
			where: { id: sub.id },
			data: { status: "canceled", cancelAtPeriodEnd: true },
		});

		logger.info({ userId }, "Subscription canceled");
	}

	async getSubscription(userId: string): Promise<SubscriptionRecord | null> {
		const sub = await prisma.subscription.findFirst({
			where: { userId, provider: this.adapter.name },
			orderBy: { createdAt: "desc" },
		});

		if (!sub) return null;

		if (sub.providerSubscriptionId) {
			try {
				const providerSub = await this.adapter.getSubscription(
					sub.providerSubscriptionId,
				);
				if (sub.status !== providerSub.status) {
					await prisma.subscription.update({
						where: { id: sub.id },
						data: { status: providerSub.status },
					});
					sub.status = providerSub.status;
				}
			} catch (error) {
				logger.warn(
					{ userId, error },
					"Failed to sync subscription with provider",
				);
			}
		}

		return toRecord(sub);
	}

	async listPlans(): Promise<SubscriptionPlan[]> {
		return this.adapter.listPlans();
	}

	async hasActiveSubscription(userId: string): Promise<boolean> {
		const sub = await prisma.subscription.findFirst({
			where: {
				userId,
				provider: this.adapter.name,
				status: { in: ["active", "trialing"] },
			},
		});
		return sub !== null;
	}

	private async processWebhookEvent(event: WebhookEvent): Promise<void> {
		const data = event.data as Record<string, unknown> | undefined;
		if (!data?.id) return;

		const providerSubscriptionId = String(data.id);

		switch (event.type) {
			case "subscription.active":
			case "subscription.updated":
			case "subscription.uncanceled": {
				const dbSub = await prisma.subscription.findFirst({
					where: { providerSubscriptionId },
				});

				if (dbSub) {
					await prisma.subscription.update({
						where: { id: dbSub.id },
						data: {
							status: String(data.status ?? "active"),
							cancelAtPeriodEnd:
								(data.cancel_at_period_end as boolean) ?? false,
							trialEnd: data.trial_end
								? new Date(String(data.trial_end))
								: null,
							...(data.current_period_start
								? {
										currentPeriodStart: new Date(
											String(data.current_period_start),
										),
									}
								: {}),
							...(data.current_period_end
								? {
										currentPeriodEnd: new Date(String(data.current_period_end)),
									}
								: {}),
						},
					});
				}
				break;
			}

			case "subscription.canceled":
			case "subscription.revoked":
				await prisma.subscription.updateMany({
					where: { providerSubscriptionId },
					data: { status: "canceled", cancelAtPeriodEnd: true },
				});
				break;

			case "checkout.created": {
				const checkoutData = data as Record<string, unknown>;
				const metadata = checkoutData.metadata as
					| Record<string, string>
					| undefined;
				const userId = metadata?.user_id;

				if (userId) {
					await prisma.subscription.upsert({
						where: {
							userId_provider: {
								userId,
								provider: this.adapter.name,
							},
						},
						update: {
							providerSubscriptionId: String(
								checkoutData.subscription_id ?? "",
							),
							status: String(checkoutData.status ?? "incomplete"),
						},
						create: {
							userId,
							planId: String(checkoutData.product_id ?? ""),
							status: String(checkoutData.status ?? "incomplete"),
							provider: this.adapter.name,
							providerSubscriptionId: String(
								checkoutData.subscription_id ?? "",
							),
							currentPeriodStart: new Date(),
							currentPeriodEnd: new Date(),
						},
					});
				}
				break;
			}
		}
	}
}
