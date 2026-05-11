import { authClient } from "@monorepo/auth/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthGuard } from "./components/auth-guard";
import { DashboardPage } from "./pages/dashboard";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { LoginPage } from "./pages/login";
import { PlansPage } from "./pages/plans";
import { RegisterPage } from "./pages/register";
import { ResetPasswordPage } from "./pages/reset-password";

function RootRedirect() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<div className="text-muted-foreground text-sm">Loading...</div>
			</div>
		);
	}

	return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password" element={<ResetPasswordPage />} />
				<Route path="/" element={<RootRedirect />} />
				<Route element={<AuthGuard />}>
					<Route path="/dashboard" element={<DashboardPage />} />
					<Route path="/plans" element={<PlansPage />} />
				</Route>
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
