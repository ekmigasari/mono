import { cn } from "@monorepo/ui/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type = "text", ...props }, ref) {
	return (
		<input
			data-slot="input"
			type={type}
			ref={ref}
			className={cn(
				"border-input file:text-foreground placeholder:text-muted-foreground flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
});

export { Input };
