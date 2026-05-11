const API_BASE = `${import.meta.env.VITE_BETTER_AUTH_URL}/api/v1/subscription`;

interface ApiResponse<T> {
	data?: T;
	error?: string;
}

async function request<T>(
	path: string,
	init?: RequestInit,
): Promise<ApiResponse<T>> {
	try {
		const res = await fetch(`${API_BASE}${path}`, {
			credentials: "include",
			headers: { "Content-Type": "application/json", ...init?.headers },
			...init,
		});
		const body = await res.json();
		if (!res.ok) {
			return { error: body.error ?? "Request failed" };
		}
		return { data: body as T };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Network error" };
	}
}

export interface Plan {
	id: string;
	name: string;
	description: string | null;
	price: number;
	currency: string;
	interval: "month" | "year";
	trialDays: number;
	providerPlanId: string;
	active: boolean;
}

export interface Subscription {
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
}

export async function getPlans() {
	return request<{ plans: Plan[] }>("/plans");
}

export async function getCurrentSubscription() {
	return request<{ subscription: Subscription | null }>("/current");
}

export async function createCheckout(planId: string) {
	return request<{ url: string }>("/checkout", {
		method: "POST",
		body: JSON.stringify({ planId }),
	});
}

export async function cancelSubscription() {
	return request<{ success: boolean }>("/cancel", {
		method: "POST",
	});
}
