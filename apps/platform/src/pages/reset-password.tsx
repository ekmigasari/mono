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
import { useNavigate, useSearchParams } from "react-router";

export function ResetPasswordPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmPasswordRef = useRef<HTMLInputElement>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		const newPassword = passwordRef.current?.value;
		const confirmPassword = confirmPasswordRef.current?.value;
		if (!newPassword || !confirmPassword || !token) {
			setError("Invalid request");
			setLoading(false);
			return;
		}

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			setLoading(false);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		const { error: resetError } = await authClient.resetPassword({
			newPassword,
			token,
		});

		if (resetError) {
			setError(
				resetError.message ||
					resetError.statusText ||
					"Failed to reset password",
			);
			setLoading(false);
			return;
		}

		navigate("/login");
	}

	if (!token) {
		return (
			<div className="flex min-h-svh items-center justify-center p-4">
				<Card className="w-full max-w-sm">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Invalid link</CardTitle>
						<CardDescription>
							This password reset link is invalid or expired.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => navigate("/forgot-password")}
						>
							Request new link
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Reset password</CardTitle>
					<CardDescription>Enter your new password</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">New password</Label>
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
							<Label htmlFor="confirmPassword">Confirm new password</Label>
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
							Reset password
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
