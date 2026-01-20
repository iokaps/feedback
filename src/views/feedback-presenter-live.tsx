import { usePlayersWithOnlineStatus } from '@/hooks/usePlayersWithOnlineStatus';
import { feedbackStore } from '@/state/stores/feedback-store';
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

	const sentimentColors = {
		positive: '#10B981', // green
		neutral: '#F59E0B', // amber
		negative: '#EF4444' // red
	};

	return (
		<div
			style={{
				backgroundColor: '#F8FAFC',
				minHeight: '100vh',
				padding: '2rem'
			}}
		>
			<div className="mx-auto max-w-6xl space-y-8">
				{/* Header */}
				<h1 className="text-5xl font-bold text-slate-900">Live Feedback</h1>

				{/* Response Counter */}
				<div
					style={{ backgroundColor: '#EFF6FF' }}
					className="rounded-2xl border-2 border-blue-200 p-8"
				>
					<div className="flex items-baseline gap-6">
						<span className="text-7xl font-bold text-blue-600">
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
								style={{
									borderLeft: `8px solid ${sentimentColors[comment.sentiment]}`,
									backgroundColor: '#FFFFFF'
								}}
								className="rounded-lg p-6 shadow-md"
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
						<p className="py-12 text-center text-2xl text-slate-600">
							No comments yet. Waiting for feedback...
						</p>
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
										className="rounded-lg bg-white px-6 py-4 shadow-md"
									>
										<p className="mb-2 text-lg text-slate-600">Q{qIndex + 1}</p>
										<p className="text-3xl font-bold text-slate-900">
											{average.toFixed(1)}
											<span className="text-2xl">★</span>
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
