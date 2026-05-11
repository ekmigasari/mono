import { parseClientEnv } from "@monorepo/types";
import { createAuthClient } from "better-auth/react";

interface Env {
	env: Record<string, unknown>;
}

const metaEnv = (import.meta as unknown as Env).env;

export const clientEnv = parseClientEnv(metaEnv);

type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient: AuthClient = createAuthClient({
	baseURL: clientEnv.VITE_BETTER_AUTH_URL,
});
