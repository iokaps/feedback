import { kmClient } from '@/services/km-client';

export interface ColorCustomization {
	primary: string;
	primaryLight: string;
	secondary: string;
	secondaryLight: string;
	success: string;
	successLight: string;
	warning: string;
	warningLight: string;
	danger: string;
	dangerLight: string;
}

export interface GameConfigState {
	/** Duration of the game in minutes */
	gameDuration: number;
	/** Whether to display QR code on presenter screen */
	showPresenterQr: boolean;
	/** URL of uploaded event logo */
	logoUrl: string;
	/** ID of uploaded logo for deletion */
	logoId: string;
	/** Custom color palette for the game */
	colors: ColorCustomization;
}

const initialState: GameConfigState = {
	gameDuration: 10,
	showPresenterQr: true,
	logoUrl: '',
	logoId: '',
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
};

/**
 * Domain: Game Configuration
 *
 * Global store for game configuration - parameters that define HOW the game plays
 * and host-level settings that affect all clients.
 * Synced across all clients. Typically modified by host before or during game.
 *
 * Use this store for:
 * - Game duration, round count
 * - Game settings/options changed by host
 * - Team configurations
 * - Dynamic questions/content for the game
 * - Pesenter display preferences (QR visibility, etc.)
 * - Any settings that affect dynamic game configuration and need to be synced globally
 *
 * Note: This is different from static `config` from `src/config/schema.ts` which is read-only and set at app build time. Game config store state is dynamic and can change during game.
 *
 * @see gameConfigActions for mutations
 */

export const gameConfigStore = kmClient.store<GameConfigState>(
	'game-config',
	initialState
);
