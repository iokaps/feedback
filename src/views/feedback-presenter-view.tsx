import { config } from '@/config';
import { feedbackActions } from '@/state/actions/feedback-actions';
import { feedbackStore } from '@/state/stores/feedback-store';
import { useSnapshot } from '@kokimoki/app';
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
			<div
				style={{
					position: 'fixed',
					bottom: '2rem',
					right: '2rem',
					display: 'flex',
					gap: '0.5rem',
					zIndex: 50
				}}
			>
				<button
					onClick={handlePrevView}
					style={{
						backgroundColor: '#E2E8F0',
						color: '#334155',
						padding: '0.75rem 1rem',
						borderRadius: '0.5rem',
						border: 'none',
						cursor: 'pointer',
						fontSize: '1rem',
						fontWeight: '600',
						transition: 'all 0.2s'
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLButtonElement).style.backgroundColor =
							'#CBD5E1';
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLButtonElement).style.backgroundColor =
							'#E2E8F0';
					}}
				>
					◄
				</button>

				<button
					onClick={() => feedbackActions.switchPresenterView('live')}
					style={{
						backgroundColor: presenterView === 'live' ? '#3B82F6' : '#E2E8F0',
						color: presenterView === 'live' ? '#FFFFFF' : '#334155',
						padding: '0.75rem 1.25rem',
						borderRadius: '0.5rem',
						border: 'none',
						cursor: 'pointer',
						fontSize: '1rem',
						fontWeight: '600',
						transition: 'all 0.2s'
					}}
					onMouseEnter={(e) => {
						if (presenterView !== 'live') {
							(e.currentTarget as HTMLButtonElement).style.backgroundColor =
								'#CBD5E1';
						}
					}}
					onMouseLeave={(e) => {
						if (presenterView !== 'live') {
							(e.currentTarget as HTMLButtonElement).style.backgroundColor =
								'#E2E8F0';
						}
					}}
				>
					{config.presenterLiveViewLabel}
				</button>

				<button
					onClick={() => feedbackActions.switchPresenterView('analysis')}
					style={{
						backgroundColor:
							presenterView === 'analysis' ? '#3B82F6' : '#E2E8F0',
						color: presenterView === 'analysis' ? '#FFFFFF' : '#334155',
						padding: '0.75rem 1.25rem',
						borderRadius: '0.5rem',
						border: 'none',
						cursor: 'pointer',
						fontSize: '1rem',
						fontWeight: '600',
						transition: 'all 0.2s'
					}}
					onMouseEnter={(e) => {
						if (presenterView !== 'analysis') {
							(e.currentTarget as HTMLButtonElement).style.backgroundColor =
								'#CBD5E1';
						}
					}}
					onMouseLeave={(e) => {
						if (presenterView !== 'analysis') {
							(e.currentTarget as HTMLButtonElement).style.backgroundColor =
								'#E2E8F0';
						}
					}}
				>
					{config.presenterAnalysisViewLabel}
				</button>

				<button
					onClick={() => feedbackActions.switchPresenterView('insights')}
					style={{
						backgroundColor:
							presenterView === 'insights' ? '#3B82F6' : '#E2E8F0',
						color: presenterView === 'insights' ? '#FFFFFF' : '#334155',
						padding: '0.75rem 1.25rem',
						borderRadius: '0.5rem',
						border: 'none',
						cursor: 'pointer',
						fontSize: '1rem',
						fontWeight: '600',
						transition: 'all 0.2s'
					}}
					onMouseEnter={(e) => {
						if (presenterView !== 'insights') {
							(e.currentTarget as HTMLButtonElement).style.backgroundColor =
								'#CBD5E1';
						}
					}}
					onMouseLeave={(e) => {
						if (presenterView !== 'insights') {
							(e.currentTarget as HTMLButtonElement).style.backgroundColor =
								'#E2E8F0';
						}
					}}
				>
					{config.presenterInsightsViewLabel}
				</button>

				<button
					onClick={handleNextView}
					style={{
						backgroundColor: '#E2E8F0',
						color: '#334155',
						padding: '0.75rem 1rem',
						borderRadius: '0.5rem',
						border: 'none',
						cursor: 'pointer',
						fontSize: '1rem',
						fontWeight: '600',
						transition: 'all 0.2s'
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLButtonElement).style.backgroundColor =
							'#CBD5E1';
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLButtonElement).style.backgroundColor =
							'#E2E8F0';
					}}
				>
					►
				</button>
			</div>
		</div>
	);
};
