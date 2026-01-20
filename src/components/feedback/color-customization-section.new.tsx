import { config } from '@/config';
import { gameConfigActions } from '@/state/actions/game-config-actions';
import { gameConfigStore } from '@/state/stores/game-config-store';
import { cn } from '@/utils/cn';
import { colorPresets, getMatchingPresetId } from '@/utils/color-presets';
import { useSnapshot } from '@kokimoki/app';
import { RotateCcw } from 'lucide-react';
import React from 'react';
import { ColorPicker } from './color-picker';

export function ColorCustomizationSection() {
	const { colors } = useSnapshot(gameConfigStore.proxy);
	const [showAdvanced, setShowAdvanced] = React.useState(false);

	const activePresetId = getMatchingPresetId(colors);
	const isCustom = activePresetId === null;

	return (
		<div className="bg-bg-card space-y-4 rounded-xl p-6 shadow-md">
			{/* Header */}
			<h3 className="text-text-dark font-semibold">
				{config.colorCustomizationLabel}
			</h3>

			{/* Preset Buttons Section */}
			<div className="space-y-3">
				<p className="text-text-dark text-sm font-medium">
					{config.colorPresetsLabel}
				</p>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
					{colorPresets.map((preset) => {
						const isActive = activePresetId === preset.id;
						return (
							<button
								key={preset.id}
								onClick={() => gameConfigActions.applyColorPreset(preset.id)}
								className={cn(
									'flex flex-col items-center gap-2 rounded-lg px-3 py-3 transition-all',
									isActive
										? 'border-primary bg-primary-light border-2 shadow-md'
										: 'border-secondary-light hover:border-primary border-2'
								)}
							>
								{/* Color preview swatches */}
								<div className="flex gap-1">
									<div
										className="h-6 w-6 rounded-full shadow-sm"
										style={{ backgroundColor: preset.colors.primary }}
										title="Primary"
									/>
									<div
										className="h-6 w-6 rounded-full shadow-sm"
										style={{ backgroundColor: preset.colors.secondary }}
										title="Secondary"
									/>
									<div
										className="h-6 w-6 rounded-full shadow-sm"
										style={{ backgroundColor: preset.colors.success }}
										title="Success"
									/>
								</div>
								<span className="text-text-dark text-xs font-medium">
									{preset.name}
								</span>
								{isActive && (
									<span className="text-primary text-xs font-semibold">
										✓ Active
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* Custom indicator */}
				{isCustom && (
					<div className="bg-warning-light rounded-lg px-3 py-2">
						<p className="text-warning text-xs font-medium">
							{config.customPresetLabel} — Modify individual colors below
						</p>
					</div>
				)}
			</div>

			{/* Advanced Colors Section */}
			<div className="border-border border-t-2 pt-4">
				<button
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="hover:bg-secondary-light/50 flex w-full items-center justify-between rounded-lg px-3 py-2"
				>
					<p className="text-text-dark text-sm font-medium">
						{config.advancedColorsLabel}
					</p>
					<span
						className={cn(
							'text-secondary transition-transform',
							showAdvanced && 'rotate-180'
						)}
					>
						▼
					</span>
				</button>

				{showAdvanced && (
					<div className="space-y-4 pt-4">
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
		</div>
	);
}
