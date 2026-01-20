import { config } from '@/config';
import Markdown from 'react-markdown';

/**
 * Example view demonstrating how to display lobby content before game starts.
 * Modify or replace with your own implementation.
 */
export function GameLobbyView() {
	return (
		<div className="flex w-full flex-col items-center gap-6">
			{/* Animated floating card */}
			<article className="km-card-float prose prose-sm max-w-2xl rounded-2xl bg-white/90 p-8 shadow-xl backdrop-blur-sm">
				<Markdown>{config.gameLobbyMd}</Markdown>
			</article>

			{/* Waiting indicator with bouncing dots */}
			<div className="km-fade-in flex flex-col items-center gap-3">
				<div className="km-dots-loader">
					<span />
					<span />
					<span />
				</div>
				<p className="text-primary text-sm font-medium">
					Waiting for game to start...
				</p>
			</div>
		</div>
	);
}
