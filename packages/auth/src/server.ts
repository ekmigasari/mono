import { prisma } from "@monorepo/db";
import {
	ResetPasswordEmail,
	render,
	sendEmail,
	WelcomeEmail,
} from "@monorepo/email";
import { env } from "@monorepo/types/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createElement } from "react";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [
		"http://localhost:3000",
		"http://localhost:4000",
		env.VITE_APP_URL,
	],
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({
			user,
			url,
		}: {
			user: { name: string; email: string };
			url: string;
		}) => {
			const html = await render(
				createElement(ResetPasswordEmail, {
					username: user.name,
					resetLink: url,
				}),
			);
			await sendEmail({
				from: env.EMAIL_FROM,
				to: user.email,
				subject: "Reset your password",
				html,
			});
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({
			user,
			url,
		}: {
			user: { name: string; email: string };
			url: string;
		}) => {
			const parsed = new URL(url);
			parsed.searchParams.set("callbackURL", `${env.VITE_APP_URL}/dashboard`);
			const html = await render(
				createElement(WelcomeEmail, {
					username: user.name,
					verificationLink: parsed.toString(),
				}),
			);
			await sendEmail({
				from: env.EMAIL_FROM,
				to: user.email,
				subject: "Verify your email",
				html,
			});
		},
	},
});
