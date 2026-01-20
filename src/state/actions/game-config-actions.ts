import { kmClient } from '@/services/km-client';
import {
	gameConfigStore,
	type ColorCustomization
} from '../stores/game-config-store';

/**
 * Actions for game config mutations.
 *
 * Typically used by host to configure game parameters and presenter display preferences.
 */
export const gameConfigActions = {
	/** Change game duration in minutes */
	async changeGameDuration(duration: number) {
		await kmClient.transact([gameConfigStore], ([gameConfigState]) => {
			gameConfigState.gameDuration = duration;
		});
	},

	/** Toggle QR code visibility for presenter screen */
	async togglePresenterQr() {
		await kmClient.transact([gameConfigStore], ([gameConfigState]) => {
			gameConfigState.showPresenterQr = !gameConfigState.showPresenterQr;
		});
	},

	/** Update a custom color */
	async updateColor(colorKey: keyof ColorCustomization, value: string) {
		await kmClient.transact([gameConfigStore], ([gameConfigState]) => {
			gameConfigState.colors[colorKey] = value;
		});
	},

	/** Reset colors to default palette */
	async resetColorsToDefault() {
		await kmClient.transact([gameConfigStore], ([gameConfigState]) => {
			gameConfigState.colors = {
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
			};
		});
	}
};
