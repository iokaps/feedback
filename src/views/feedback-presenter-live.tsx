import { config } from '@/config';
import { usePlayersWithOnlineStatus } from '@/hooks/usePlayersWithOnlineStatus';
import { feedbackStore } from '@/state/stores/feedback-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

interface CommentWithMetadata {
	clientId: string;
	text: string;
	playerName: string;
	sentiment: 'positive' | 'neutral' | 'negative';
}

const shuffleComments = (
	comments: CommentWithMetadata[]
): CommentWithMetadata[] => {
	const shuffled = [...comments];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

export const FeedbackPresenterLive: React.FC = () => {
	const feedbackState = useSnapshot(feedbackStore.proxy);
	const { onlinePlayersCount } = usePlayersWithOnlineStatus();
	const { feedbackResponses, questions, anonymousMode } = feedbackState;
	const [shuffledComments, setShuffledComments] = React.useState<
		CommentWithMetadata[]
	>([]);

	const aggregatedData = React.useMemo(() => {
		const totalResponses = Object.keys(feedbackResponses).length;

		// Calculate player-specific averages for sentiment classification
		const playerAverages: Record<string, number> = {};
		Object.entries(feedbackResponses).forEach(([clientId, response]) => {
			const ratings = Object.values(response.ratings).filter(
				(r) => r !== undefined
			);
			if (ratings.length > 0) {
				playerAverages[clientId] =
					ratings.reduce((a, b) => a + b, 0) / ratings.length;
			}
		});

		// Build comments with sentiment
		const comments: CommentWithMetadata[] = [];
		Object.entries(feedbackResponses).forEach(([clientId, response]) => {
			Object.entries(response.textResponses).forEach(([_qIndex, text]) => {
				if (text && text.trim()) {
					const avgRating = playerAverages[clientId] || 3;
					let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
					if (avgRating > 4) sentiment = 'positive';
					else if (avgRating < 2) sentiment = 'negative';

					comments.push({
						clientId,
						text,
						playerName: 'Participant',
						sentiment
					});
				}
			});
		});

		return { totalResponses, comments };
	}, [feedbackResponses]);

	// Shuffle comments when they change
	React.useEffect(() => {
		setShuffledComments(shuffleComments(aggregatedData.comments));
	}, [aggregatedData.comments]);

	const responsePercentage =
		onlinePlayersCount > 0
			? Math.round((aggregatedData.totalResponses / onlinePlayersCount) * 100)
			: 0;

	return (
		<div className="bg-bg-light min-h-screen p-8">
			<div className="mx-auto max-w-6xl space-y-8">
				{/* Header */}
				<h1 className="from-primary bg-gradient-to-r to-cyan-600 bg-clip-text text-5xl font-bold text-transparent">
					{config.presenterLiveViewLabel} Feedback
				</h1>

				{/* Response Counter */}
				<div className="km-fade-in bg-primary-light border-primary rounded-2xl border-2 p-8">
					<div className="flex items-baseline gap-6">
						<span className="text-primary text-7xl font-bold">
							{aggregatedData.totalResponses}
						</span>
						<span className="text-3xl font-semibold text-slate-700">
							/ {onlinePlayersCount} responses ({responsePercentage}%)
						</span>
					</div>
				</div>

				{/* Comment Stream */}
				<div className="space-y-4">
					{shuffledComments.length > 0 ? (
						shuffledComments.map((comment, idx) => (
							<div
								key={idx}
								className={cn(
									'km-fade-in rounded-xl border-l-8 bg-white p-6 shadow-md transition-shadow hover:shadow-lg',
									comment.sentiment === 'positive' && 'border-success',
									comment.sentiment === 'neutral' && 'border-warning',
									comment.sentiment === 'negative' && 'border-danger'
								)}
								style={{ animationDelay: `${idx * 0.1}s` }}
							>
								<p className="mb-3 text-2xl text-slate-900">{comment.text}</p>
								{!anonymousMode && (
									<p className="text-sm text-slate-600">
										— {comment.playerName}
									</p>
								)}
							</div>
						))
					) : (
						<div className="flex flex-col items-center justify-center py-16">
							<div className="km-dots-loader mb-4">
								<span />
								<span />
								<span />
							</div>
							<p className="text-2xl text-slate-600">
								No comments yet. Waiting for feedback...
							</p>
						</div>
					)}
				</div>

				{/* Average Ratings per Question */}
				{questions.length > 0 && (
					<div className="mt-12 space-y-4 border-t-2 border-slate-300 pt-8">
						<h3 className="mb-6 text-3xl font-semibold text-slate-900">
							Average Ratings
						</h3>
						<div className="flex flex-wrap gap-4">
							{questions.map((question, qIndex) => {
								if (question.type !== 'rating') return null;

								const qIndexStr = qIndex.toString();
								const ratings = Object.values(feedbackResponses)
									.map((r) => r.ratings[qIndexStr])
									.filter((r) => r !== undefined);

								const average =
									ratings.length > 0
										? ratings.reduce((a, b) => a + b, 0) / ratings.length
										: 0;

								return (
									<div
										key={qIndex}
										className="km-fade-in rounded-xl bg-white px-6 py-4 shadow-md transition-shadow hover:shadow-lg"
										style={{ animationDelay: `${qIndex * 0.05}s` }}
									>
										<p className="text-primary mb-2 text-lg font-medium">
											Q{qIndex + 1}
										</p>
										<p className="text-3xl font-bold text-slate-900">
											{average.toFixed(1)}
											<span className="ml-1 text-2xl text-yellow-400">★</span>
										</p>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
