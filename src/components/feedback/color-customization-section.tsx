import { config } from '@/config';
import { gameConfigActions } from '@/state/actions/game-config-actions';
import { gameConfigStore } from '@/state/stores/game-config-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { RotateCcw } from 'lucide-react';
import React from 'react';
import { ColorPicker } from './color-picker';

export function ColorCustomizationSection() {
	const { colors } = useSnapshot(gameConfigStore.proxy);
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<div className="bg-bg-card space-y-4 rounded-xl p-6 shadow-md">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="hover:bg-secondary-light/50 flex w-full items-center justify-between rounded-lg px-4 py-3"
			>
				<h3 className="text-text-dark font-semibold">
					{config.colorCustomizationLabel}
				</h3>
				<span
					className={cn(
						'text-secondary transition-transform',
						isOpen && 'rotate-180'
					)}
				>
					▼
				</span>
			</button>

			{isOpen && (
				<div className="border-border space-y-6 border-t-2 pt-6">
					{/* Color Pickers Grid */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<ColorPicker
							label="Primary"
							value={colors.primary}
							onChange={(value) =>
								gameConfigActions.updateColor('primary', value)
							}
						/>
						<ColorPicker
							label="Primary Light"
							value={colors.primaryLight}
							onChange={(value) =>
								gameConfigActions.updateColor('primaryLight', value)
							}
						/>
						<ColorPicker
							label="Secondary"
							value={colors.secondary}
							onChange={(value) =>
								gameConfigActions.updateColor('secondary', value)
							}
						/>
						<ColorPicker
							label="Secondary Light"
							value={colors.secondaryLight}
							onChange={(value) =>
								gameConfigActions.updateColor('secondaryLight', value)
							}
						/>
						<ColorPicker
							label="Success"
							value={colors.success}
							onChange={(value) =>
								gameConfigActions.updateColor('success', value)
							}
						/>
						<ColorPicker
							label="Success Light"
							value={colors.successLight}
							onChange={(value) =>
								gameConfigActions.updateColor('successLight', value)
							}
						/>
						<ColorPicker
							label="Warning"
							value={colors.warning}
							onChange={(value) =>
								gameConfigActions.updateColor('warning', value)
							}
						/>
						<ColorPicker
							label="Warning Light"
							value={colors.warningLight}
							onChange={(value) =>
								gameConfigActions.updateColor('warningLight', value)
							}
						/>
						<ColorPicker
							label="Danger"
							value={colors.danger}
							onChange={(value) =>
								gameConfigActions.updateColor('danger', value)
							}
						/>
						<ColorPicker
							label="Danger Light"
							value={colors.dangerLight}
							onChange={(value) =>
								gameConfigActions.updateColor('dangerLight', value)
							}
						/>
					</div>

					{/* Color Preview */}
					<div className="border-border space-y-3 border-t-2 pt-4">
						<p className="text-text-dark text-sm font-medium">Preview</p>
						<div className="flex gap-2">
							<div
								className="h-12 w-12 rounded-lg shadow-md"
								style={{ backgroundColor: colors.primary }}
								title="Primary"
							/>
							<div
								className="h-12 w-12 rounded-lg shadow-md"
								style={{ backgroundColor: colors.secondary }}
								title="Secondary"
							/>
							<div
								className="h-12 w-12 rounded-lg shadow-md"
								style={{ backgroundColor: colors.success }}
								title="Success"
							/>
							<div
								className="h-12 w-12 rounded-lg shadow-md"
								style={{ backgroundColor: colors.warning }}
								title="Warning"
							/>
							<div
								className="h-12 w-12 rounded-lg shadow-md"
								style={{ backgroundColor: colors.danger }}
								title="Danger"
							/>
						</div>
					</div>

					{/* Reset Button */}
					<button
						onClick={() => gameConfigActions.resetColorsToDefault()}
						className="km-btn-secondary inline-flex gap-2"
					>
						<RotateCcw className="size-5" />
						{config.resetColorsButton}
					</button>
				</div>
			)}
		</div>
	);
}
