import type { ColorCustomization } from '@/state/stores/game-config-store';

export interface ColorPreset {
	id: string;
	name: string;
	colors: ColorCustomization;
}

export const colorPresets: ColorPreset[] = [
	{
		id: 'fresh-modern',
		name: 'Fresh & Modern',
		colors: {
			primary: '#14b8a6',
			primaryLight: '#ccfbf1',
			secondary: '#64748b',
			secondaryLight: '#f1f5f9',
			success: '#10b981',
			successLight: '#d1fae5',
			warning: '#f59e0b',
			warningLight: '#fef3c7',
			danger: '#ef4444',
			dangerLight: '#fee2e2'
		}
	},
	{
		id: 'bold-vibrant',
		name: 'Bold & Vibrant',
		colors: {
			primary: '#ec4899',
			primaryLight: '#fce7f3',
			secondary: '#6366f1',
			secondaryLight: '#e0e7ff',
			success: '#16a34a',
			successLight: '#dcfce7',
			warning: '#ea580c',
			warningLight: '#ffedd5',
			danger: '#dc2626',
			dangerLight: '#fecaca'
		}
	},
	{
		id: 'professional',
		name: 'Professional',
		colors: {
			primary: '#1e40af',
			primaryLight: '#dbeafe',
			secondary: '#475569',
			secondaryLight: '#e2e8f0',
			success: '#047857',
			successLight: '#d1fae5',
			warning: '#b45309',
			warningLight: '#fef3c7',
			danger: '#991b1b',
			dangerLight: '#fee2e2'
		}
	},
	{
		id: 'warm',
		name: 'Warm',
		colors: {
			primary: '#ea580c',
			primaryLight: '#fed7aa',
			secondary: '#d97706',
			secondaryLight: '#fef3c7',
			success: '#c2410c',
			successLight: '#fed7aa',
			warning: '#f97316',
			warningLight: '#ffedd5',
			danger: '#dc2626',
			dangerLight: '#fecaca'
		}
	},
	{
		id: 'dark-mode',
		name: 'Dark Mode',
		colors: {
			primary: '#06b6d4',
			primaryLight: '#164e63',
			secondary: '#71717a',
			secondaryLight: '#3f3f46',
			success: '#10b981',
			successLight: '#064e3b',
			warning: '#f59e0b',
			warningLight: '#78350f',
			danger: '#ef4444',
			dangerLight: '#7f1d1d'
		}
	}
];

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): ColorPreset | undefined {
	return colorPresets.find((p) => p.id === id);
}

/**
 * Check if current colors match any preset
 */
export function getMatchingPresetId(colors: ColorCustomization): string | null {
	for (const preset of colorPresets) {
		const matches = Object.keys(preset.colors).every(
			(key) =>
				preset.colors[key as keyof ColorCustomization] ===
				colors[key as keyof ColorCustomization]
		);
		if (matches) {
			return preset.id;
		}
	}
	return null;
}
