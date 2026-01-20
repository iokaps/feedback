import {
	withModeGuard,
	type ModeGuardProps
} from '@/components/with-mode-guard';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { feedbackStore } from '@/state/stores/feedback-store';
import { gameConfigStore } from '@/state/stores/game-config-store';
import { gameSessionStore } from '@/state/stores/game-session-store';
import { cn } from '@/utils/cn';
import { ConnectionsView } from '@/views/connections-view';
import { FeedbackPresenterView } from '@/views/feedback-presenter-view';
import { useSnapshot } from '@kokimoki/app';
import { KmQrCode } from '@kokimoki/shared';

function App({ clientContext }: ModeGuardProps<'presenter'>) {
	useGlobalController();
	useDocumentTitle(config.title);

	const { started } = useSnapshot(gameSessionStore.proxy);
	const { showPresenterQr } = useSnapshot(gameConfigStore.proxy);
	const { feedbackResponses, eventType } = useSnapshot(feedbackStore.proxy);

	const playerLink = generateLink(clientContext.playerCode, {
		mode: 'player'
	});

	// Show feedback dashboard if game ended and feedback was collected
	const showFeedbackDashboard =
		!started && Object.keys(feedbackResponses).length > 0 && eventType;

	return (
		<>
			<HostPresenterLayout.Root>
				<HostPresenterLayout.Header />

				<HostPresenterLayout.Main>
					{showFeedbackDashboard ? (
						<FeedbackPresenterView />
					) : (
						<ConnectionsView>
							<KmQrCode
								data={playerLink}
								size={200}
								className={cn({
									invisible: !showPresenterQr
								})}
							/>
						</ConnectionsView>
					)}
				</HostPresenterLayout.Main>
			</HostPresenterLayout.Root>
		</>
	);
}

export default withModeGuard(App, 'presenter');
