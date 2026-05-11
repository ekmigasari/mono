import { env } from "@monorepo/types/server";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
	username: string;
	resetLink: string;
}

const baseUrl = env.VITE_APP_URL
	? `https://${env.VITE_APP_URL}`
	: "http://app.dazzboard.co";

export const ResetPasswordEmail = ({
	username = "there",
	resetLink = "https://example.com/reset",
}: ResetPasswordEmailProps) => {
	const previewText = `Reset your Dazzboard password, ${username}!`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Img
						src={`${baseUrl}/logo.png`}
						alt="Dazzboard"
						width={48}
						height={48}
						style={logo}
					/>
					<Heading style={heading}>Reset your password</Heading>
					<Text style={paragraph}>Hi {username},</Text>
					<Text style={paragraph}>
						Someone requested a password reset for your Dazzboard account. Click
						the button below to set a new password.
					</Text>
					<Section style={btnContainer}>
						<Button style={button} href={resetLink}>
							Reset Password
						</Button>
					</Section>
					<Text style={paragraph}>
						Or copy and paste this link into your browser:
					</Text>
					<Link style={link} href={resetLink}>
						{resetLink}
					</Link>
					<Text style={paragraph}>
						If you didn't request this, you can safely ignore this email.
					</Text>
					<Hr style={hr} />
					<Text style={footer}>
						If you didn't request a password reset, no further action is needed.
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	border: "1px solid #e6e6e6",
	borderRadius: "8px",
	margin: "40px auto",
	padding: "40px 32px",
	maxWidth: "560px",
};

const logo = {
	margin: "0 auto 24px",
};

const heading = {
	color: "#1a1a1a",
	fontSize: "24px",
	fontWeight: "600",
	lineHeight: "1.3",
	margin: "0 0 16px",
	textAlign: "center" as const,
};

const paragraph = {
	color: "#525252",
	fontSize: "16px",
	lineHeight: "1.5",
	margin: "0 0 24px",
};

const btnContainer = {
	textAlign: "center" as const,
	marginBottom: "24px",
};

const button = {
	backgroundColor: "#7c3aed",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "600",
	padding: "12px 24px",
	textDecoration: "none",
};

const link = {
	color: "#7c3aed",
	fontSize: "14px",
	wordBreak: "break-all" as const,
};

const hr = {
	borderColor: "#e6e6e6",
	margin: "24px 0",
};

const footer = {
	color: "#a3a3a3",
	fontSize: "14px",
	lineHeight: "1.5",
	margin: "0",
};
