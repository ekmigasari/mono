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

export function RegisterPage() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const nameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmPasswordRef = useRef<HTMLInputElement>(null);

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

	async function handleEmailSignUp(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		const name = nameRef.current?.value;
		const email = emailRef.current?.value;
		const password = passwordRef.current?.value;
		const confirmPassword = confirmPasswordRef.current?.value;
		if (!name || !email || !password || !confirmPassword) {
			setError("Please fill in all fields");
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		const { error: signUpError } = await authClient.signUp.email({
			name,
			email,
			password,
		});

		if (signUpError) {
			setError(
				signUpError.message ||
					signUpError.statusText ||
					"Failed to create account",
			);
			setLoading(false);
			return;
		}

		navigate("/dashboard");
	}

	function handleGoogleSignUp() {
		authClient.signIn.social({
			provider: "google",
			callbackURL: `${clientEnv.VITE_APP_URL}/dashboard`,
		});
	}

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create an account</CardTitle>
					<CardDescription>Join Dazzboard today</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleEmailSignUp} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input id="name" ref={nameRef} placeholder="John Doe" required />
						</div>
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
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								ref={passwordRef}
								placeholder="••••••••"
								minLength={8}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm password</Label>
							<Input
								id="confirmPassword"
								type="password"
								ref={confirmPasswordRef}
								placeholder="••••••••"
								minLength={8}
								required
							/>
						</div>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<Button type="submit" disabled={loading} className="w-full">
							{loading && <Spinner className="size-4 animate-spin" />}
							Create account
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
						onClick={handleGoogleSignUp}
					>
						<GoogleLogo className="size-4" />
						Google
					</Button>
					<p className="text-muted-foreground mt-4 text-center text-sm">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-foreground underline underline-offset-4 hover:no-underline"
						>
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
