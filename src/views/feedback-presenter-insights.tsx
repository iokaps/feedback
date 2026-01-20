import { feedbackStore } from '@/state/stores/feedback-store';
import { useSnapshot } from '@kokimoki/app';
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

	const getSatisfactionColor = (percentage: number) => {
		if (percentage > 80) return '#D1FAE5'; // light green
		if (percentage >= 60) return '#FFFBEB'; // light amber
		return '#FEE2E2'; // light red
	};

	return (
		<div style={{ minHeight: '100vh', padding: '2rem' }}>
			<div className="mx-auto max-w-6xl space-y-8">
				{/* Header */}
				<h1 className="mb-8 text-5xl font-bold text-slate-900">Insights</h1>

				{/* Overall Satisfaction Banner */}
				<div
					style={{
						backgroundColor: getSatisfactionColor(
							categorized.overallSatisfaction
						)
					}}
					className="rounded-2xl border-4 border-slate-200 p-12"
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
								Overall Satisfaction Score
							</p>
						</div>
					</div>
				</div>

				{/* Went Well Section */}
				<div
					style={{
						backgroundColor: '#D1FAE5',
						borderLeft: '8px solid #10B981'
					}}
					className="rounded-lg p-8"
				>
					<div className="mb-6 flex items-center gap-3">
						<span className="text-4xl">✓</span>
						<h2 className="text-3xl font-bold text-slate-900">Went Well</h2>
					</div>
					<div className="space-y-4">
						{categorized.wellComments.length > 0 ? (
							categorized.wellComments.map((comment, idx) => (
								<div key={idx} className="rounded-lg bg-white p-6">
									<p className="text-xl text-slate-900">{comment.text}</p>
									<p className="mt-3 text-sm text-slate-600">
										— {comment.playerName}
									</p>
								</div>
							))
						) : (
							<p className="text-xl text-slate-700 italic">
								No positive feedback yet
							</p>
						)}
					</div>
				</div>

				{/* Improvement Ideas Section */}
				<div
					style={{
						backgroundColor: '#FFFBEB',
						borderLeft: '8px solid #F59E0B'
					}}
					className="rounded-lg p-8"
				>
					<div className="mb-6 flex items-center gap-3">
						<span className="text-4xl">💡</span>
						<h2 className="text-3xl font-bold text-slate-900">
							Improvement Ideas
						</h2>
					</div>
					<div className="space-y-4">
						{categorized.improvementComments.length > 0 ? (
							categorized.improvementComments.map((comment, idx) => (
								<div key={idx} className="rounded-lg bg-white p-6">
									<p className="text-xl text-slate-900">{comment.text}</p>
									<p className="mt-3 text-sm text-slate-600">
										— {comment.playerName}
									</p>
								</div>
							))
						) : (
							<p className="text-xl text-slate-700 italic">
								No critical feedback
							</p>
						)}
					</div>
				</div>

				{/* Other Feedback Section */}
				<div
					style={{
						backgroundColor: '#F1F5F9',
						borderLeft: '8px solid #64748B'
					}}
					className="rounded-lg p-8"
				>
					<div className="mb-6 flex items-center gap-3">
						<span className="text-4xl">→</span>
						<h2 className="text-3xl font-bold text-slate-900">
							Other Feedback
						</h2>
					</div>
					<div className="space-y-4">
						{categorized.neutralComments.length > 0 ? (
							categorized.neutralComments.map((comment, idx) => (
								<div key={idx} className="rounded-lg bg-white p-6">
									<p className="text-xl text-slate-900">{comment.text}</p>
									<p className="mt-3 text-sm text-slate-600">
										— {comment.playerName}
									</p>
								</div>
							))
						) : (
							<p className="text-xl text-slate-700 italic">
								No neutral feedback
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
