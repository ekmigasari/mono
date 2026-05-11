import { cn } from "@monorepo/ui/lib/utils";

function Label({
	className,
	htmlFor,
	...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is passed via props
		<label
			data-slot="label"
			htmlFor={htmlFor}
			className={cn(
				"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
