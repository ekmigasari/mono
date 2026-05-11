import { authClient } from "@monorepo/auth/client";
import { Button } from "@monorepo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@monorepo/ui/components/card";
import { SignOut, Spinner } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	cancelSubscription,
	getCurrentSubscription,
	getPlans,
	type Subscription,
} from "../lib/subscription";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
	free: {
		label: "Free",
		className: "bg-secondary text-secondary-foreground",
	},
	trialing: { label: "Trial", className: "bg-blue-100 text-blue-700" },
	active: {
		label: "Active",
		className: "bg-green-100 text-green-700",
	},
	past_due: { label: "Past Due", className: "bg-amber-100 text-amber-700" },
	canceled: {
		label: "Canceled",
		className: "bg-red-100 text-red-700",
	},
	incomplete: {
		label: "Incomplete",
		className: "bg-yellow-100 text-yellow-700",
	},
};

export function DashboardPage() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const [verifySent, setVerifySent] = useState(false);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [verifyError, setVerifyError] = useState("");

	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [planName, setPlanName] = useState<string | null>(null);
	const [subLoading, setSubLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			setSubLoading(true);
			const [subRes, plansRes] = await Promise.all([
				getCurrentSubscription(),
				getPlans(),
			]);
			if (subRes.data?.subscription) {
				setSubscription(subRes.data.subscription);
				if (plansRes.data?.plans) {
					const matched = plansRes.data.plans.find(
						(p) => p.providerPlanId === subRes.data.subscription?.planId,
					);
					if (matched) setPlanName(matched.name);
				}
			}
			setSubLoading(false);
		}
		load();
	}, []);

	async function handleSignOut() {
		await authClient.signOut();
		navigate("/login");
	}

	async function handleResendVerification() {
		if (!session?.user?.email) return;
		setVerifySent(false);
		setVerifyError("");
		setVerifyLoading(true);

		const { error } = await authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: `${window.location.origin}/dashboard`,
		});

		if (error) {
			setVerifyError(error.message || "Failed to send verification email");
		} else {
			setVerifySent(true);
		}
		setVerifyLoading(false);
	}

	async function handleCancel() {
		setActionLoading("cancel");
		const res = await cancelSubscription();
		if (res.data) {
			setSubscription((prev) =>
				prev ? { ...prev, status: "canceled", cancelAtPeriodEnd: true } : prev,
			);
		}
		setActionLoading(null);
	}

	const hasSubscription = subscription !== null;
	const isActive =
		subscription?.status === "active" || subscription?.status === "trialing";
	const statusBadge = hasSubscription
		? (STATUS_BADGE[subscription.status] ?? STATUS_BADGE.free)
		: STATUS_BADGE.free;

	if (isPending) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<div className="text-muted-foreground text-sm">Loading...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh flex-col p-6">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Dazzboard</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate("/plans")}
					>
						Manage plan
					</Button>
					<Button variant="ghost" size="sm" onClick={handleSignOut}>
						<SignOut className="size-4" />
						Sign out
					</Button>
				</div>
			</header>
			<main className="mt-8 flex-1 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Welcome, {session?.user?.name || "User"}</CardTitle>
						<CardDescription>
							{session?.user?.email}
							{session?.user?.emailVerified === false && (
								<span className="text-muted-foreground ml-2 text-xs">
									(not verified)
								</span>
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground text-sm">
							You are signed in to Dazzboard. Start building!
						</p>
						{session?.user?.emailVerified === false && (
							<div className="space-y-2">
								{verifySent ? (
									<p className="text-green-600 text-sm">
										Verification email sent. Check your inbox.
									</p>
								) : (
									<>
										{verifyError && (
											<p className="text-destructive text-sm">{verifyError}</p>
										)}
										<Button
											variant="outline"
											size="sm"
											onClick={handleResendVerification}
											disabled={verifyLoading}
										>
											{verifyLoading && (
												<Spinner className="mr-1 size-3 animate-spin" />
											)}
											Resend verification email
										</Button>
									</>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Subscription</CardTitle>
							{subLoading ? (
								<Spinner className="text-muted-foreground size-4 animate-spin" />
							) : (
								<span
									className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
								>
									{statusBadge.label}
								</span>
							)}
						</div>
						<CardDescription>Your current plan and usage</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{subLoading ? (
							<div className="text-muted-foreground text-sm">
								Loading subscription...
							</div>
						) : (
							<>
								<div className="space-y-1.5">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Plan</span>
										<span className="font-medium">
											{planName ?? statusBadge.label}
										</span>
									</div>
									{subscription && (
										<>
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													{subscription.cancelAtPeriodEnd ? "Ends" : "Renewal"}
												</span>
												<span>
													{new Date(
														subscription.currentPeriodEnd,
													).toLocaleDateString()}
												</span>
											</div>
											{subscription.trialEnd && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														Trial ends
													</span>
													<span>
														{new Date(
															subscription.trialEnd,
														).toLocaleDateString()}
													</span>
												</div>
											)}
										</>
									)}
								</div>

								<div className="flex gap-2">
									{!hasSubscription || subscription.status === "canceled" ? (
										<Button
											variant="default"
											size="sm"
											onClick={() => navigate("/plans")}
										>
											Upgrade plan
										</Button>
									) : isActive && !subscription.cancelAtPeriodEnd ? (
										<Button
											variant="destructive"
											size="sm"
											disabled={actionLoading === "cancel"}
											onClick={handleCancel}
										>
											{actionLoading === "cancel" && (
												<Spinner className="mr-1 size-3 animate-spin" />
											)}
											Cancel subscription
										</Button>
									) : subscription.cancelAtPeriodEnd ? (
										<div className="text-muted-foreground text-xs">
											Subscription will end at the current period.
										</div>
									) : null}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
