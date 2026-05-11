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

interface WelcomeEmailProps {
	username: string;
	verificationLink: string;
}

const baseUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const WelcomeEmail = ({
	username = "there",
	verificationLink = "https://example.com/verify",
}: WelcomeEmailProps) => {
	const previewText = `Welcome to Dazzboard, ${username}!`;

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
					<Heading style={heading}>Welcome to Dazzboard, {username}!</Heading>
					<Text style={paragraph}>
						We're excited to have you on board. Please verify your email address
						to get started.
					</Text>
					<Section style={btnContainer}>
						<Button style={button} href={verificationLink}>
							Verify Email
						</Button>
					</Section>
					<Text style={paragraph}>
						Or copy and paste this link into your browser:
					</Text>
					<Link style={link} href={verificationLink}>
						{verificationLink}
					</Link>
					<Hr style={hr} />
					<Text style={footer}>
						If you didn't create an account, you can safely ignore this email.
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
