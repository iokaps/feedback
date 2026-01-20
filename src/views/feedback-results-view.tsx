import { config } from '@/config';
import { usePlayersWithOnlineStatus } from '@/hooks/usePlayersWithOnlineStatus';
import { feedbackActions } from '@/state/actions/feedback-actions';
import { feedbackStore } from '@/state/stores/feedback-store';
import { downloadCsv, generateCsvContent } from '@/utils/generate-csv';
import { useSnapshot } from '@kokimoki/app';
import { Download } from 'lucide-react';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';

export const FeedbackResultsView: React.FC = () => {
	const feedbackState = useSnapshot(feedbackStore.proxy);
	const { questions, feedbackResponses, eventType, anonymousMode } =
		feedbackState;
	const { onlinePlayersCount } = usePlayersWithOnlineStatus();

	const aggregatedData = feedbackActions.getAggregatedData(feedbackState);
	const { totalResponses, ratingStats, allTextResponses } = aggregatedData;

	// Response counter ref
	const counterRef = React.useRef<HTMLSpanElement>(null);

	const handleExportCsv = () => {
		const content = generateCsvContent(
			eventType,
			questions,
			feedbackResponses,
			anonymousMode
		);
		downloadCsv(content, eventType);
	};

	const responsePercentage =
		onlinePlayersCount > 0
			? Math.round((totalResponses / onlinePlayersCount) * 100)
			: 0;

	return (
		<div className="space-y-8">
			<div className="prose prose-sm max-w-none">
				<ReactMarkdown>{config.feedbackResultsMd}</ReactMarkdown>
			</div>

			{/* Response Counter */}
			<div className="rounded-lg bg-blue-50 p-6">
				<p className="mb-2 text-sm text-slate-600">
					{config.responseCounterLabel}
				</p>
				<div className="flex items-baseline gap-4">
					<span ref={counterRef} className="text-5xl font-bold text-blue-600">
						{totalResponses}
					</span>
					<span className="text-slate-600">
						/ {onlinePlayersCount} players ({responsePercentage}%)
					</span>
				</div>
			</div>

			{/* Rating Distributions */}
			{questions.map((question, qIndex) => {
				if (question.type !== 'rating') return null;

				const qIndexStr = qIndex.toString();
				const stats = ratingStats[qIndexStr];
				if (!stats) return null;

				const maxCount = Math.max(...Object.values(stats.distribution));

				return (
					<div key={qIndex} className="space-y-4">
						<div>
							<h3 className="mb-1 font-medium text-slate-900">
								Q{qIndex + 1}: {question.text}
							</h3>
							<p className="text-sm text-slate-600">
								Average: {stats.average.toFixed(1)} / 5 stars
							</p>
						</div>

						<div className="space-y-2">
							{[5, 4, 3, 2, 1].map((rating) => {
								const count = stats.distribution[rating];
								const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

								return (
									<div key={rating} className="flex items-center gap-3">
										<span className="w-12 text-sm font-medium">{rating}★</span>
										<div className="h-8 flex-1 overflow-hidden rounded bg-slate-200">
											<div
												className="h-full bg-yellow-400 transition-all duration-500"
												style={{
													width: `${percentage}%`
												}}
											/>
										</div>
										<span className="w-12 text-right text-sm text-slate-600">
											{count}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}

			{/* Open Text Responses */}
			{allTextResponses.length > 0 && (
				<div className="space-y-4">
					<h3 className="font-medium text-slate-900">Comments & Feedback</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{allTextResponses.map((response, idx) => (
							<div
								key={idx}
								className="rounded-lg border border-slate-200 bg-slate-50 p-4"
							>
								<p className="text-slate-700">{response}</p>
								{!anonymousMode && (
									<p className="mt-2 text-xs text-slate-500">Anonymous</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Export Button */}
			<div className="flex gap-3">
				<button onClick={handleExportCsv} className="km-btn-primary">
					<Download className="size-5" />
					{config.exportCsvButton}
				</button>
			</div>
		</div>
	);
};
