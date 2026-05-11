import { authClient } from "@monorepo/auth/client";
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
import { Spinner } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

export function ForgotPasswordPage() {
	const navigate = useNavigate();
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const emailRef = useRef<HTMLInputElement>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		const email = emailRef.current?.value;
		if (!email) {
			setError("Please enter your email");
			setLoading(false);
			return;
		}

		const { error: forgotError } = await authClient.requestPasswordReset({
			email,
			redirectTo: `${window.location.origin}/reset-password`,
		});

		if (forgotError) {
			setError(
				forgotError.message ||
					forgotError.statusText ||
					"Failed to send reset email",
			);
			setLoading(false);
			return;
		}

		setSent(true);
		setLoading(false);
	}

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Forgot password</CardTitle>
					<CardDescription>
						Enter your email and we&apos;ll send you a reset link
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sent ? (
						<div className="space-y-4">
							<p className="text-sm">
								If an account exists with that email, we&apos;ve sent a password
								reset link. Please check your inbox.
							</p>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => navigate("/login")}
							>
								Back to sign in
							</Button>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
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
							{error && <p className="text-destructive text-sm">{error}</p>}
							<Button type="submit" disabled={loading} className="w-full">
								{loading && <Spinner className="size-4 animate-spin" />}
								Send reset link
							</Button>
							<p className="text-muted-foreground text-center text-sm">
								Remember your password?{" "}
								<Link
									to="/login"
									className="text-foreground underline underline-offset-4 hover:no-underline"
								>
									Sign in
								</Link>
							</p>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
