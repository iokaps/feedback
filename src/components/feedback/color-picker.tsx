import { cn } from '@/utils/cn';

interface ColorPickerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function ColorPicker({
	label,
	value,
	onChange,
	className
}: ColorPickerProps) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<label className="text-text-dark text-sm font-medium">{label}</label>
			<div className="flex items-center gap-3">
				<input
					type="color"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="border-border h-12 w-12 cursor-pointer rounded-lg border-2"
				/>
				<span className="text-text-dark font-mono text-sm">{value}</span>
			</div>
		</div>
	);
}
