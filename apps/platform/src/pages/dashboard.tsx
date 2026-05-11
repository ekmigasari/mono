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
import { useState } from "react";
import { useNavigate } from "react-router";

export function DashboardPage() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const [verifySent, setVerifySent] = useState(false);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [verifyError, setVerifyError] = useState("");

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
				<Button variant="ghost" size="sm" onClick={handleSignOut}>
					<SignOut className="size-4" />
					Sign out
				</Button>
			</header>
			<main className="mt-8 flex-1">
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
			</main>
		</div>
	);
}
