import { z } from "zod";

export const serverSchema = z.object({
	DATABASE_URL: z.string().min(1),
	BETTER_AUTH_SECRET: z.string().min(1),
	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	RESEND_API_KEY: z.string().min(1),
	EMAIL_FROM: z.string().email().default("noreply@dazzboard.com"),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	VITE_APP_URL: z.string().url(),
	POLAR_ACCESS_TOKEN: z.string().min(1),
	POLAR_WEBHOOK_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export const env = serverSchema.parse(process.env);
