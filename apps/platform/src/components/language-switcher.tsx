import { Button } from "@monorepo/ui/components/button";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	function toggleLanguage() {
		i18n.changeLanguage(i18n.language === "en" ? "id" : "en");
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggleLanguage}
			className="fixed right-4 top-4 z-50"
		>
			{i18n.language === "en" ? "ID" : "EN"}
		</Button>
	);
}
