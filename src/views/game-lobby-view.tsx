import { config } from '@/config';
import Markdown from 'react-markdown';

/**
 * Example view demonstrating how to display lobby content before game starts.
 * Modify or replace with your own implementation.
 */
export function GameLobbyView() {
	return (
		<article className="prose prose-sm max-w-2xl rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
			<Markdown>{config.gameLobbyMd}</Markdown>
		</article>
	);
}
