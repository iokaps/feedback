import { config } from '@/config';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { feedbackActions } from '@/state/actions/feedback-actions';
import { localPlayerActions } from '@/state/actions/local-player-actions';
import { feedbackStore } from '@/state/stores/feedback-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { Star } from 'lucide-react';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';

export const GameFeedbackView: React.FC = () => {
	const { questions, anonymousMode, editableUntil, feedbackResponses } =
		useSnapshot(feedbackStore.proxy);
	const serverTime = useServerTimer();

	const currentClientResponse = feedbackResponses[kmClient.id];
	const isEditing = !!currentClientResponse;

	// Initialize form with existing response or empty
	const [ratings, setRatings] = React.useState<Record<string, number>>(() => {
		if (currentClientResponse) {
			return { ...currentClientResponse.ratings };
		}
		const initialRatings: Record<string, number> = {};
		questions.forEach((_, i) => {
			initialRatings[i.toString()] = 0;
		});
		return initialRatings;
	});

	const [textResponses, setTextResponses] = React.useState<
		Record<string, string>
	>(() => {
		if (currentClientResponse) {
			return { ...currentClientResponse.textResponses };
		}
		const initialTexts: Record<string, string> = {};
		questions.forEach((_, i) => {
			initialTexts[i.toString()] = '';
		});
		return initialTexts;
	});

	const [isAnonymous, setIsAnonymous] = React.useState(anonymousMode);
	const [submitted, setSubmitted] = React.useState(isEditing);

	// Check if can still edit
	const canEdit = serverTime < editableUntil;

	// Validate all ratings are filled
	const allRatingsFilled = questions
		.map((_, i) => i.toString())
		.filter((i) => {
			const qIndex = parseInt(i);
			return questions[qIndex]?.type === 'rating';
		})
		.every((i) => ratings[i] > 0);

	const handleRatingChange = (questionIndex: number, rating: number) => {
		setRatings((prev) => ({
			...prev,
			[questionIndex.toString()]: rating
		}));
	};

	const handleTextChange = (questionIndex: number, text: string) => {
		setTextResponses((prev) => ({
			...prev,
			[questionIndex.toString()]: text
		}));
	};

	const handleSubmit = async () => {
		if (!allRatingsFilled) {
			alert('Please rate all questions');
			return;
		}

		try {
			if (isEditing) {
				await feedbackActions.editFeedback(ratings, textResponses);
			} else {
				await feedbackActions.submitFeedback(ratings, textResponses);
			}
			setSubmitted(true);
		} catch (error) {
			console.error('Failed to submit feedback:', error);
			alert('Failed to submit feedback');
		}
	};

	const handleSkip = async () => {
		if (
			!isEditing &&
			confirm('Are you sure you want to skip providing feedback?')
		) {
			await localPlayerActions.setCurrentView('lobby');
		}
	};

	if (questions.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-slate-600">No feedback form available</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl space-y-6">
			<div className="prose prose-sm max-w-none">
				<ReactMarkdown>{config.feedbackFormMd}</ReactMarkdown>
			</div>

			{submitted && (
				<div className="bg-success-light text-success border-success rounded-lg border-l-4 p-4">
					✓ {isEditing ? 'Feedback updated' : 'Feedback submitted'}{' '}
					successfully!
				</div>
			)}

			{!canEdit && !submitted && (
				<div className="bg-warning-light text-warning border-warning rounded-lg border-l-4 p-4">
					⚠️ Feedback collection period has ended. You can no longer submit or
					edit feedback.
				</div>
			)}

			{!submitted && canEdit && (
				<form className="space-y-6">
					<p className="text-sm text-slate-600">
						{config.feedbackInstructionsMd}
					</p>

					{/* Questions */}
					{questions.map((question, qIndex) => (
						<div
							key={qIndex}
							className="bg-bg-card border-primary space-y-3 rounded-lg border-l-4 p-4 shadow-sm"
						>
							<p className="text-primary text-sm font-semibold">
								Question {qIndex + 1} of {questions.length}
							</p>
							<p className="text-text-dark font-medium">{question.text}</p>

							{question.type === 'rating' && (
								<div className="flex gap-2 pt-2">
									{[1, 2, 3, 4, 5].map((star) => (
										<button
											key={star}
											type="button"
											onClick={() => handleRatingChange(qIndex, star)}
											className={cn(
												'transform transition-all hover:scale-110',
												ratings[qIndex.toString()] >= star
													? 'text-yellow-400 drop-shadow-md'
													: 'text-slate-300 hover:text-yellow-200'
											)}
										>
											<Star className="size-8 fill-current" />
										</button>
									))}
								</div>
							)}

							{question.type === 'text' && (
								<textarea
									value={textResponses[qIndex.toString()] || ''}
									onChange={(e) => handleTextChange(qIndex, e.target.value)}
									placeholder="Your response (optional)"
									className="km-input min-h-24"
									disabled={!canEdit}
								/>
							)}
						</div>
					))}

					{/* Anonymous toggle */}
					<div className="bg-primary-light flex items-center gap-2 rounded-lg p-3">
						<input
							type="checkbox"
							id="anonymous"
							checked={isAnonymous}
							onChange={(e) => setIsAnonymous(e.target.checked)}
							disabled={!canEdit}
							className="accent-primary rounded"
						/>
						<label
							htmlFor="anonymous"
							className="text-primary text-sm font-medium"
						>
							{config.feedbackAnonymousLabel}
						</label>
					</div>

					{/* Buttons */}
					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!allRatingsFilled || !canEdit}
							className="km-btn-primary flex-1"
						>
							{isEditing ? 'Update Feedback' : config.feedbackSubmitButton}
						</button>
						{!isEditing && (
							<button
								type="button"
								onClick={handleSkip}
								className="km-btn-secondary"
							>
								{config.feedbackSkipButton}
							</button>
						)}
					</div>

					{!canEdit && (
						<p className="text-sm text-slate-600">
							{config.feedbackEditableUntilLabel}
						</p>
					)}
				</form>
			)}
		</div>
	);
};
