import { z } from "zod";

export const clientSchema = z.object({
	VITE_BETTER_AUTH_URL: z.string().url(),
	VITE_APP_URL: z.string().url(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

export function parseClientEnv(meta: Record<string, unknown>): ClientEnv {
	return clientSchema.parse(meta);
}
