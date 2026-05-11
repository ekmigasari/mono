import { authClient } from "@monorepo/auth/client";
import { Navigate, Outlet } from "react-router";

export function AuthGuard() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<div className="text-muted-foreground text-sm">Loading...</div>
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
