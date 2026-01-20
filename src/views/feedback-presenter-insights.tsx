import { config } from '@/config';
import { feedbackStore } from '@/state/stores/feedback-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { Lightbulb, MessageSquare, ThumbsUp } from 'lucide-react';
import * as React from 'react';

interface CategorizedFeedback {
	text: string;
	playerName: string;
}

export const FeedbackPresenterInsights: React.FC = () => {
	const feedbackState = useSnapshot(feedbackStore.proxy);
	const { feedbackResponses, anonymousMode } = feedbackState;

	const categorized = React.useMemo(() => {
		const wellComments: CategorizedFeedback[] = [];
		const improvementComments: CategorizedFeedback[] = [];
		const neutralComments: CategorizedFeedback[] = [];

		let totalRating = 0;
		let ratingCount = 0;

		Object.entries(feedbackResponses).forEach(([_clientId, response]) => {
			// Calculate average rating for this player
			const ratings = Object.values(response.ratings).filter(
				(r) => r !== undefined
			);
			let playerAverage = 3;
			if (ratings.length > 0) {
				playerAverage = ratings.reduce((a, b) => a + b, 0) / ratings.length;
				totalRating += ratings.reduce((a, b) => a + b, 0);
				ratingCount += ratings.length;
			}

			// Categorize text responses
			Object.entries(response.textResponses).forEach(([_qIndex, text]) => {
				if (text && text.trim()) {
					const feedback: CategorizedFeedback = {
						text,
						playerName: anonymousMode ? 'Anonymous' : 'Participant'
					};

					if (playerAverage > 3.5) {
						wellComments.push(feedback);
					} else if (playerAverage < 2.5) {
						improvementComments.push(feedback);
					} else {
						neutralComments.push(feedback);
					}
				}
			});
		});

		const overallSatisfaction =
			ratingCount > 0 ? Math.round((totalRating / ratingCount / 5) * 100) : 0;

		return {
			wellComments: wellComments.slice(0, 3),
			improvementComments: improvementComments.slice(0, 3),
			neutralComments: neutralComments.slice(0, 3),
			overallSatisfaction
		};
	}, [feedbackResponses, anonymousMode]);

	const getSatisfactionEmoji = (percentage: number) => {
		if (percentage > 80) return '😊';
		if (percentage >= 60) return '😐';
		return '😞';
	};

	const getSatisfactionBgClass = (percentage: number) => {
		if (percentage > 80) return 'bg-success-light border-success';
		if (percentage >= 60) return 'bg-warning-light border-warning';
		return 'bg-danger-light border-danger';
	};

	return (
		<div className="bg-bg-light min-h-screen p-8">
			<div className="mx-auto max-w-6xl space-y-8">
				{/* Header */}
				<h1 className="from-primary mb-8 bg-gradient-to-r to-cyan-600 bg-clip-text text-5xl font-bold text-transparent">
					{config.presenterInsightsViewLabel}
				</h1>

				{/* Overall Satisfaction Banner */}
				<div
					className={cn(
						'km-fade-in rounded-2xl border-4 p-12',
						getSatisfactionBgClass(categorized.overallSatisfaction)
					)}
				>
					<div className="flex items-center gap-6">
						<span className="text-7xl">
							{getSatisfactionEmoji(categorized.overallSatisfaction)}
						</span>
						<div>
							<p className="text-5xl font-bold text-slate-900">
								{categorized.overallSatisfaction}% Satisfied
							</p>
							<p className="mt-2 text-2xl text-slate-700">
								{config.presenterOverallSatisfactionLabel}
							</p>
						</div>
					</div>
				</div>

				{/* Went Well Section */}
				<div className="km-fade-in bg-success-light border-success rounded-xl border-l-8 p-8">
					<div className="mb-6 flex items-center gap-3">
						<ThumbsUp className="text-success size-10" />
						<h2 className="text-3xl font-bold text-slate-900">
							{config.presenterWentWellLabel}
						</h2>
					</div>
					<div className="space-y-4">
						{categorized.wellComments.length > 0 ? (
							categorized.wellComments.map((comment, idx) => (
								<div
									key={idx}
									className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
								>
									<p className="text-xl text-slate-900">{comment.text}</p>
									<p className="mt-3 text-sm text-slate-600">
										— {comment.playerName}
									</p>
								</div>
							))
						) : (
							<p className="text-xl italic text-slate-700">
								No positive feedback yet
							</p>
						)}
					</div>
				</div>

				{/* Improvement Ideas Section */}
				<div
					className="km-fade-in bg-warning-light border-warning rounded-xl border-l-8 p-8"
					style={{ animationDelay: '0.1s' }}
				>
					<div className="mb-6 flex items-center gap-3">
						<Lightbulb className="text-warning size-10" />
						<h2 className="text-3xl font-bold text-slate-900">
							{config.presenterImprovementLabel}
						</h2>
					</div>
					<div className="space-y-4">
						{categorized.improvementComments.length > 0 ? (
							categorized.improvementComments.map((comment, idx) => (
								<div
									key={idx}
									className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
								>
									<p className="text-xl text-slate-900">{comment.text}</p>
									<p className="mt-3 text-sm text-slate-600">
										— {comment.playerName}
									</p>
								</div>
							))
						) : (
							<p className="text-xl italic text-slate-700">
								No critical feedback
							</p>
						)}
					</div>
				</div>

				{/* Other Feedback Section */}
				<div
					className="km-fade-in bg-secondary-light border-secondary rounded-xl border-l-8 p-8"
					style={{ animationDelay: '0.2s' }}
				>
					<div className="mb-6 flex items-center gap-3">
						<MessageSquare className="text-secondary size-10" />
						<h2 className="text-3xl font-bold text-slate-900">
							{config.presenterNeutralLabel}
						</h2>
					</div>
					<div className="space-y-4">
						{categorized.neutralComments.length > 0 ? (
							categorized.neutralComments.map((comment, idx) => (
								<div
									key={idx}
									className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
								>
									<p className="text-xl text-slate-900">{comment.text}</p>
									<p className="mt-3 text-sm text-slate-600">
										— {comment.playerName}
									</p>
								</div>
							))
						) : (
							<p className="text-xl italic text-slate-700">
								No neutral feedback
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
