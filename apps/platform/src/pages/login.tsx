import { authClient, clientEnv } from "@monorepo/auth/client";
import { Button } from "@monorepo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@monorepo/ui/components/card";
import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";
import { GoogleLogo, Spinner } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

export function LoginPage() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	if (sessionPending) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<Spinner className="size-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (session) {
		return <Navigate to="/dashboard" replace />;
	}

	async function handleEmailSignIn(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		const email = emailRef.current?.value;
		const password = passwordRef.current?.value;
		if (!email || !password) {
			setError("Please fill in all fields");
			setLoading(false);
			return;
		}

		const { error: signInError } = await authClient.signIn.email({
			email,
			password,
		});

		if (signInError) {
			setError(
				signInError.message ||
					signInError.statusText ||
					"Invalid email or password",
			);
			setLoading(false);
			return;
		}

		navigate("/dashboard");
	}

	function handleGoogleSignIn() {
		authClient.signIn.social({
			provider: "google",
			callbackURL: `${clientEnv.VITE_APP_URL}/dashboard`,
		});
	}

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Sign in</CardTitle>
					<CardDescription>Welcome back to Dazzboard</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleEmailSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								ref={emailRef}
								placeholder="name@example.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<Link
									to="/forgot-password"
									className="text-muted-foreground text-xs underline-offset-4 hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								id="password"
								type="password"
								ref={passwordRef}
								placeholder="••••••••"
								required
							/>
						</div>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<Button type="submit" disabled={loading} className="w-full">
							{loading && <Spinner className="size-4 animate-spin" />}
							Sign in
						</Button>
					</form>
					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card text-muted-foreground px-2">
								Or continue with
							</span>
						</div>
					</div>
					<Button
						variant="outline"
						className="w-full"
						onClick={handleGoogleSignIn}
					>
						<GoogleLogo className="size-4" />
						Google
					</Button>
					<p className="text-muted-foreground mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link
							to="/register"
							className="text-foreground underline underline-offset-4 hover:no-underline"
						>
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
