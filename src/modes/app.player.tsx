import { PlayerMenu } from '@/components/menu';
import { NameLabel } from '@/components/name-label';
import { withKmProviders } from '@/components/with-km-providers';
import { withModeGuard } from '@/components/with-mode-guard';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { PlayerLayout } from '@/layouts/player';
import { feedbackActions } from '@/state/actions/feedback-actions';
import { localPlayerActions } from '@/state/actions/local-player-actions';
import { gameConfigStore } from '@/state/stores/game-config-store';
import { gameSessionStore } from '@/state/stores/game-session-store';
import { localPlayerStore } from '@/state/stores/local-player-store';
import { CreateProfileView } from '@/views/create-profile-view';
import { GameFeedbackView } from '@/views/game-feedback-view';
import { GameLobbyView } from '@/views/game-lobby-view';

import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

const App: React.FC = () => {
	useDocumentTitle(config.title);
	useGlobalController();

	const { name, currentView } = useSnapshot(localPlayerStore.proxy);
	const { started, startTimestamp } = useSnapshot(gameSessionStore.proxy);
	const { gameDuration } = useSnapshot(gameConfigStore.proxy);
	const gameStartedRef = React.useRef(false);

	React.useEffect(() => {
		// Calculate when feedback should become editable
		const editableUntil = startTimestamp + gameDuration * 60 * 1000;
		feedbackActions.setEditableUntil(editableUntil);
	}, [startTimestamp, gameDuration]);

	React.useEffect(() => {
		// When game starts, move to feedback collection (the main game is feedback)
		if (started && !gameStartedRef.current) {
			gameStartedRef.current = true;
			localPlayerActions.setCurrentView('feedback');
		}
		// When game ends, keep feedback view visible so players can review/edit
		else if (!started && gameStartedRef.current) {
			gameStartedRef.current = false;
			// Keep feedback view visible after game ends
		}
	}, [started]);

	if (!name) {
		return (
			<PlayerLayout.Root>
				<PlayerLayout.Header />
				<PlayerLayout.Main>
					<CreateProfileView />
				</PlayerLayout.Main>
			</PlayerLayout.Root>
		);
	}

	if (currentView === 'feedback') {
		return (
			<PlayerLayout.Root>
				<PlayerLayout.Header />

				<PlayerLayout.Main>
					<GameFeedbackView />
				</PlayerLayout.Main>

				<PlayerLayout.Footer>
					<NameLabel name={name} />
				</PlayerLayout.Footer>
			</PlayerLayout.Root>
		);
	}

	if (!started) {
		return (
			<PlayerLayout.Root>
				<PlayerLayout.Header>
					<PlayerMenu />
				</PlayerLayout.Header>

				<PlayerLayout.Main>
					<GameLobbyView />
				</PlayerLayout.Main>

				<PlayerLayout.Footer>
					<NameLabel name={name} />
				</PlayerLayout.Footer>
			</PlayerLayout.Root>
		);
	}

	return (
		<PlayerLayout.Root>
			<PlayerLayout.Header />

			<PlayerLayout.Main>
				<GameFeedbackView />
			</PlayerLayout.Main>

			<PlayerLayout.Footer>
				<NameLabel name={name} />
			</PlayerLayout.Footer>
		</PlayerLayout.Root>
	);
};

export default withKmProviders(withModeGuard(App, 'player'));
