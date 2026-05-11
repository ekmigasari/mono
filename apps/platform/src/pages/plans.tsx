import { Button } from "@monorepo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@monorepo/ui/components/card";
import { ArrowLeft, Check, Spinner, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	cancelSubscription,
	createCheckout,
	getCurrentSubscription,
	getPlans,
	type Plan,
	type Subscription,
} from "../lib/subscription";

interface PlanDisplay {
	tier: string;
	name: string;
	price: string;
	interval: string;
	features: string[];
	limitations: string[];
	cta: string;
	popular: boolean;
	providerPlanId?: string;
}

const FREE_PLAN: PlanDisplay = {
	tier: "Free",
	name: "Free",
	price: "$0",
	interval: "forever",
	features: ["1 project", "Basic analytics", "Community support"],
	limitations: [],
	cta: "Current plan",
	popular: false,
};

function polarPlanToDisplay(plan: Plan, index: number): PlanDisplay {
	const price = (plan.price / 100).toFixed(0);
	const isPremium = index === 0;
	const isPlatinum = index === 1;

	return {
		tier: isPlatinum ? "Platinum" : "Premium",
		name: plan.name,
		price: `$${price}`,
		interval: plan.interval === "year" ? "/year" : "/month",
		features: isPlatinum
			? [
					"Unlimited projects",
					"Advanced analytics & reports",
					"Priority support",
					"Custom integrations",
					"Team collaboration",
					"API access",
				]
			: ["10 projects", "Advanced analytics", "Email support", "Export data"],
		limitations: [],
		cta: "Subscribe",
		popular: isPremium,
		providerPlanId: plan.providerPlanId,
	};
}

function getPlanDisplay(
	subscription: Subscription | null,
	plans: Plan[],
): { name: string; badge: string } {
	if (!subscription) return { name: "Free", badge: "Free" };

	switch (subscription.status) {
		case "trialing":
			return { name: "Trial", badge: "Trial" };
		case "active": {
			const matchedPlan = plans.find(
				(p) => p.providerPlanId === subscription.planId,
			);
			const planName = matchedPlan?.name ?? subscription.planId;
			return { name: planName, badge: planName };
		}
		case "past_due":
			return { name: "Past Due", badge: "Past Due" };
		case "canceled":
			return { name: "Canceled", badge: "Canceled" };
		default:
			return { name: subscription.status, badge: subscription.status };
	}
}

function getPlanTier(subscription: Subscription | null, plans: Plan[]): string {
	if (!subscription) return "free";
	const matchedPlan = plans.find(
		(p) => p.providerPlanId === subscription.planId,
	);
	if (!matchedPlan) return "free";
	const index = plans.indexOf(matchedPlan);
	if (index <= 0) return "premium";
	return "platinum";
}

export function PlansPage() {
	const navigate = useNavigate();
	const [plans, setPlans] = useState<Plan[]>([]);
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			const [plansRes, subRes] = await Promise.all([
				getPlans(),
				getCurrentSubscription(),
			]);
			if (cancelled) return;
			if (plansRes.data) setPlans(plansRes.data.plans);
			if (subRes.data) setSubscription(subRes.data.subscription);
			if (plansRes.error) setError(plansRes.error);
			setLoading(false);
		}
		load();
		return () => {
			cancelled = true;
		};
	}, []);

	const currentTier = getPlanTier(subscription, plans);
	const currentPlanDisplay = getPlanDisplay(subscription, plans);

	const displayPlans: PlanDisplay[] = [
		FREE_PLAN,
		...plans.map(polarPlanToDisplay),
	];

	async function handleAction(planDisplay: PlanDisplay) {
		if (!planDisplay.providerPlanId) return;

		setActionLoading(planDisplay.tier);
		setError("");

		const res = await createCheckout(planDisplay.providerPlanId);
		if (res.data?.url) {
			window.location.href = res.data.url;
		} else {
			setError(res.error ?? "Failed to create checkout session");
			setActionLoading(null);
		}
	}

	async function handleCancel() {
		setActionLoading("cancel");
		setError("");
		const res = await cancelSubscription();
		if (res.data) {
			await load();
		} else {
			setError(res.error ?? "Failed to cancel subscription");
		}
		setActionLoading(null);
	}

	if (loading) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<div className="text-muted-foreground text-sm">Loading plans...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh flex-col p-6">
			<header className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/dashboard")}
					>
						<ArrowLeft className="size-4" />
						Back
					</Button>
					<h1 className="text-xl font-semibold">Plans & Pricing</h1>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<span className="text-muted-foreground">Current plan:</span>
					<span
						className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
							currentPlanDisplay.badge === "Free"
								? "bg-secondary text-secondary-foreground"
								: currentPlanDisplay.badge === "Trial"
									? "bg-blue-100 text-blue-700"
									: "bg-green-100 text-green-700"
						}`}
					>
						{currentPlanDisplay.badge}
					</span>
				</div>
			</header>

			<main className="mt-10 flex-1">
				{error && (
					<div className="text-destructive mb-6 text-center text-sm">
						{error}
					</div>
				)}

				<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
					{displayPlans.map((plan) => {
						const isCurrentPlan = currentTier === plan.tier.toLowerCase();

						return (
							<Card
								key={plan.tier}
								className={`relative flex flex-col ${
									plan.popular ? "border-primary shadow-lg" : ""
								} ${isCurrentPlan ? "ring-primary ring-2" : ""}`}
							>
								{plan.popular && (
									<div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-medium">
										Most popular
									</div>
								)}
								<CardHeader>
									<CardTitle>{plan.tier}</CardTitle>
									<CardDescription>{plan.name}</CardDescription>
									<div className="mt-2">
										<span className="text-3xl font-bold">{plan.price}</span>
										<span className="text-muted-foreground ml-1 text-sm">
											{plan.interval}
										</span>
									</div>
								</CardHeader>
								<CardContent className="flex-1">
									<ul className="space-y-2">
										{plan.features.map((f) => (
											<li key={f} className="flex items-start gap-2 text-sm">
												<Check className="mt-0.5 size-4 shrink-0 text-green-600" />
												<span>{f}</span>
											</li>
										))}
										{plan.limitations.map((l) => (
											<li key={l} className="flex items-start gap-2 text-sm">
												<X className="mt-0.5 size-4 shrink-0 text-red-500" />
												<span className="text-muted-foreground">{l}</span>
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter>
									{isCurrentPlan && plan.providerPlanId ? (
										<div className="w-full space-y-2">
											<Button variant="outline" className="w-full" disabled>
												Current plan
											</Button>
											<Button
												variant="destructive"
												size="sm"
												className="w-full"
												disabled={actionLoading === "cancel"}
												onClick={handleCancel}
											>
												{actionLoading === "cancel" && (
													<Spinner className="mr-1 size-3 animate-spin" />
												)}
												Cancel subscription
											</Button>
										</div>
									) : isCurrentPlan && !plan.providerPlanId ? (
										<Button variant="outline" className="w-full" disabled>
											Current plan
										</Button>
									) : plan.tier === "Free" ? (
										<Button variant="outline" className="w-full" disabled>
											Free
										</Button>
									) : (
										<Button
											className="w-full"
											variant={plan.popular ? "default" : "outline"}
											disabled={actionLoading === plan.tier}
											onClick={() => handleAction(plan)}
										>
											{actionLoading === plan.tier ? (
												<>
													<Spinner className="mr-1 size-3 animate-spin" />
													Redirecting...
												</>
											) : subscription?.status === "trialing" ? (
												"Upgrade"
											) : subscription && currentTier === "free" ? (
												"Subscribe"
											) : (
												"Switch plan"
											)}
										</Button>
									)}
								</CardFooter>
							</Card>
						);
					})}
				</div>

				{subscription?.trialEnd && (
					<p className="text-muted-foreground mt-6 text-center text-xs">
						Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}
					</p>
				)}
			</main>
		</div>
	);
}
