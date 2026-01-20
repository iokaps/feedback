import { config } from '@/config';
import { feedbackStore } from '@/state/stores/feedback-store';
import { cn } from '@/utils/cn';
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

	const getBarColor = (rating: number) => {
		switch (rating) {
			case 5:
				return 'bg-success';
			case 4:
				return 'bg-emerald-300';
			case 3:
				return 'bg-warning';
			case 2:
				return 'bg-orange-400';
			case 1:
				return 'bg-danger';
			default:
				return 'bg-slate-300';
		}
	};

	return (
		<div className="bg-secondary-light min-h-screen p-8">
			<div className="mx-auto max-w-6xl space-y-12">
				{/* Header */}
				<h1 className="from-primary bg-gradient-to-r to-cyan-600 bg-clip-text text-5xl font-bold text-transparent">
					Feedback {config.presenterAnalysisViewLabel}
				</h1>

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
						<div
							key={qIndex}
							className="km-fade-in space-y-6"
							style={{ animationDelay: `${qIndex * 0.15}s` }}
						>
							<div>
								<h2 className="mb-2 text-3xl font-bold text-slate-900">
									{question.text}
								</h2>
								<p className="text-2xl text-slate-700">
									<span className="text-primary font-bold">
										{stats.average.toFixed(1)}
									</span>
									<span className="ml-2 text-2xl text-yellow-400">★</span>
									<span className="ml-6 text-slate-600">
										out of 5 ({stats.totalCount} ratings)
									</span>
								</p>
								<p className="text-success mt-3 text-xl font-medium">
									{percentage}% rated 4-5 stars
								</p>
							</div>

							{/* Distribution Bars */}
							<div className="space-y-4 rounded-2xl bg-white p-8 shadow-lg">
								{[5, 4, 3, 2, 1].map((rating) => {
									const count = stats.distribution[rating];
									const barPercentage =
										maxCount > 0 ? (count / maxCount) * 100 : 0;

									return (
										<div key={rating} className="flex items-center gap-6">
											<span className="w-20 text-2xl font-semibold text-slate-900">
												{rating}
												<span className="ml-1 text-yellow-400">★</span>
											</span>
											<div className="h-14 flex-1 overflow-hidden rounded-xl bg-slate-200">
												<div
													className={cn(
														'h-full transition-all duration-700 ease-out',
														getBarColor(rating)
													)}
													style={{ width: `${barPercentage}%` }}
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
