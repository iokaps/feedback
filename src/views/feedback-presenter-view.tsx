import { config } from '@/config';
import { feedbackActions } from '@/state/actions/feedback-actions';
import { feedbackStore } from '@/state/stores/feedback-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { FeedbackPresenterAnalysis } from './feedback-presenter-analysis';
import { FeedbackPresenterInsights } from './feedback-presenter-insights';
import { FeedbackPresenterLive } from './feedback-presenter-live';

export const FeedbackPresenterView: React.FC = () => {
	const feedbackState = useSnapshot(feedbackStore.proxy);
	const { presenterView } = feedbackState;

	const getNextView = (current: 'live' | 'analysis' | 'insights') => {
		const views: Array<'live' | 'analysis' | 'insights'> = [
			'live',
			'analysis',
			'insights'
		];
		const currentIndex = views.indexOf(current);
		const nextIndex = (currentIndex + 1) % views.length;
		return views[nextIndex];
	};

	const getPrevView = (current: 'live' | 'analysis' | 'insights') => {
		const views: Array<'live' | 'analysis' | 'insights'> = [
			'live',
			'analysis',
			'insights'
		];
		const currentIndex = views.indexOf(current);
		const prevIndex = (currentIndex - 1 + views.length) % views.length;
		return views[prevIndex];
	};

	// Auto-rotate logic
	React.useEffect(() => {
		if (!config.presenterAutoRotateEnabled) {
			return;
		}

		const interval = setInterval(() => {
			feedbackActions.switchPresenterView(getNextView(presenterView));
		}, config.presenterAutoRotateInterval * 1000);

		return () => clearInterval(interval);
	}, [presenterView]);

	const handlePrevView = () => {
		feedbackActions.switchPresenterView(getPrevView(presenterView));
	};

	const handleNextView = () => {
		feedbackActions.switchPresenterView(getNextView(presenterView));
	};

	return (
		<div className="relative">
			{/* Views */}
			{presenterView === 'live' && <FeedbackPresenterLive />}
			{presenterView === 'analysis' && <FeedbackPresenterAnalysis />}
			{presenterView === 'insights' && <FeedbackPresenterInsights />}

			{/* Toggle Buttons - Fixed Bottom Right */}
			<div className="fixed right-8 bottom-8 z-50 flex gap-2">
				<button
					onClick={handlePrevView}
					className="rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-300"
				>
					<ChevronLeft className="size-5" />
				</button>

				<button
					onClick={() => feedbackActions.switchPresenterView('live')}
					className={cn(
						'rounded-lg px-5 py-3 font-semibold transition-all hover:scale-105',
						presenterView === 'live'
							? 'bg-primary text-white shadow-lg'
							: 'bg-slate-200 text-slate-700 hover:bg-slate-300'
					)}
				>
					{config.presenterLiveViewLabel}
				</button>

				<button
					onClick={() => feedbackActions.switchPresenterView('analysis')}
					className={cn(
						'rounded-lg px-5 py-3 font-semibold transition-all hover:scale-105',
						presenterView === 'analysis'
							? 'bg-primary text-white shadow-lg'
							: 'bg-slate-200 text-slate-700 hover:bg-slate-300'
					)}
				>
					{config.presenterAnalysisViewLabel}
				</button>

				<button
					onClick={() => feedbackActions.switchPresenterView('insights')}
					className={cn(
						'rounded-lg px-5 py-3 font-semibold transition-all hover:scale-105',
						presenterView === 'insights'
							? 'bg-primary text-white shadow-lg'
							: 'bg-slate-200 text-slate-700 hover:bg-slate-300'
					)}
				>
					{config.presenterInsightsViewLabel}
				</button>

				<button
					onClick={handleNextView}
					className="rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-300"
				>
					<ChevronRight className="size-5" />
				</button>
			</div>
		</div>
	);
};
