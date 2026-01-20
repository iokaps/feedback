import { feedbackStore } from '@/state/stores/feedback-store';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

export const FeedbackPresenterAnalysis: React.FC = () => {
	const feedbackState = useSnapshot(feedbackStore.proxy);
	const { feedbackResponses, questions } = feedbackState;

	const aggregatedData = React.useMemo(() => {
		const ratingStats: Record<
			string,
			{
				average: number;
				distribution: Record<number, number>;
				totalCount: number;
			}
		> = {};

		questions.forEach((question, qIndex) => {
			const qIndexStr = qIndex.toString();

			if (question.type === 'rating') {
				const ratings = Object.values(feedbackResponses)
					.map((r) => r.ratings[qIndexStr])
					.filter((r) => r !== undefined);

				const distribution: Record<number, number> = {
					5: 0,
					4: 0,
					3: 0,
					2: 0,
					1: 0
				};

				ratings.forEach((rating) => {
					distribution[rating as keyof typeof distribution]++;
				});

				const average =
					ratings.length > 0
						? ratings.reduce((a, b) => a + b, 0) / ratings.length
						: 0;

				ratingStats[qIndexStr] = {
					average,
					distribution,
					totalCount: ratings.length
				};
			}
		});

		return { ratingStats };
	}, [feedbackResponses, questions]);

	const barColors = {
		5: '#10B981', // green
		4: '#6EE7B7', // light green
		3: '#F59E0B', // amber
		2: '#FB923C', // orange
		1: '#EF4444' // red
	};

	return (
		<div
			style={{
				backgroundColor: '#F1F5F9',
				minHeight: '100vh',
				padding: '2rem'
			}}
		>
			<div className="mx-auto max-w-6xl space-y-12">
				{/* Header */}
				<h1 className="text-5xl font-bold text-slate-900">Feedback Analysis</h1>

				{/* Rating Charts */}
				{questions.map((question, qIndex) => {
					if (question.type !== 'rating') return null;

					const qIndexStr = qIndex.toString();
					const stats = aggregatedData.ratingStats[qIndexStr];
					if (!stats) return null;

					const maxCount = Math.max(...Object.values(stats.distribution), 1);
					const highRatings = stats.distribution[5] + stats.distribution[4];
					const percentage =
						stats.totalCount > 0
							? Math.round((highRatings / stats.totalCount) * 100)
							: 0;

					return (
						<div key={qIndex} className="space-y-6">
							<div>
								<h2 className="mb-2 text-3xl font-bold text-slate-900">
									{question.text}
								</h2>
								<p className="text-2xl text-slate-700">
									<span className="font-bold text-blue-600">
										{stats.average.toFixed(1)}
									</span>
									<span className="ml-2 text-2xl">★</span>
									<span className="ml-6 text-slate-600">
										out of 5 ({stats.totalCount} ratings)
									</span>
								</p>
								<p className="mt-3 text-xl text-slate-600">
									{percentage}% rated 4-5 stars
								</p>
							</div>

							{/* Distribution Bars */}
							<div className="space-y-4 rounded-xl bg-white p-8">
								{[5, 4, 3, 2, 1].map((rating) => {
									const count = stats.distribution[rating];
									const barPercentage =
										maxCount > 0 ? (count / maxCount) * 100 : 0;

									return (
										<div key={rating} className="flex items-center gap-6">
											<span className="w-20 text-2xl font-semibold text-slate-900">
												{rating}★
											</span>
											<div className="h-16 flex-1 overflow-hidden rounded-lg bg-slate-200">
												<div
													style={{
														width: `${barPercentage}%`,
														backgroundColor:
															barColors[rating as keyof typeof barColors],
														transition: 'width 0.5s ease-out'
													}}
													className="h-full"
												/>
											</div>
											<span className="w-20 text-right text-2xl font-semibold text-slate-900">
												{count}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
