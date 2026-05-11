import type { CreateEmailOptions } from "resend";
import { resend } from "./client";

export const sendEmail = async (payload: CreateEmailOptions) => {
	const { data, error } = await resend.emails.send(payload);

	if (error) {
		throw new Error(error.message);
	}

	return data;
};
