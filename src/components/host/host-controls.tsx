import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { feedbackActions } from '@/state/actions/feedback-actions';
import { gameConfigActions } from '@/state/actions/game-config-actions';
import {
	feedbackStore,
	type FeedbackQuestion
} from '@/state/stores/feedback-store';
import { gameConfigStore } from '@/state/stores/game-config-store';
import { gameSessionStore } from '@/state/stores/game-session-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ChevronDown, Upload } from 'lucide-react';
import * as React from 'react';
import { AIQuestionGenerator } from '../feedback/ai-question-generator';
import { ColorCustomizationSection } from '../feedback/color-customization-section';
import { GeneratedQuestionsPreview } from '../feedback/generated-questions-preview';

/**
 * Host controls for game configuration, logo upload, and feedback settings
 */
export function HostControls() {
	const { started } = useSnapshot(gameSessionStore.proxy);
	const { gameDuration, showPresenterQr, logoUrl, colors } = useSnapshot(
		gameConfigStore.proxy
	);
	const {
		eventType,
		questions,
		anonymousMode,
		feedbackResponses,
		generatedQuestions
	} = useSnapshot(feedbackStore.proxy);

	const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
	const [showFeedbackConfig, setShowFeedbackConfig] = React.useState(false);
	const [selectedEventType, setSelectedEventType] = React.useState(eventType);
	const [isAnonymous, setIsAnonymous] = React.useState(anonymousMode);
	const [editedQuestions, setEditedQuestions] =
		React.useState<FeedbackQuestion[]>(questions);
	const [showGeneratedPreview, setShowGeneratedPreview] = React.useState(false);

	// Response counter ref
	const counterRef = React.useRef<HTMLSpanElement>(null);

	// Sync editedQuestions when store questions change (e.g., after applying generated questions)
	React.useEffect(() => {
		setEditedQuestions(questions);
	}, [questions]);

	// Auto-expand feedback config when questions are applied and preview is closed
	React.useEffect(() => {
		if (questions.length > 0 && !showGeneratedPreview) {
			setShowFeedbackConfig(true);
		}
	}, [questions.length, showGeneratedPreview]);

	// Apply custom colors as CSS variables
	React.useEffect(() => {
		const style = document.documentElement.style;
		style.setProperty('--color-primary', colors.primary);
		style.setProperty('--color-primary-light', colors.primaryLight);
		style.setProperty('--color-secondary', colors.secondary);
		style.setProperty('--color-secondary-light', colors.secondaryLight);
		style.setProperty('--color-success', colors.success);
		style.setProperty('--color-success-light', colors.successLight);
		style.setProperty('--color-warning', colors.warning);
		style.setProperty('--color-warning-light', colors.warningLight);
		style.setProperty('--color-danger', colors.danger);
		style.setProperty('--color-danger-light', colors.dangerLight);
	}, [colors]);

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploadingLogo(true);
		try {
			const upload = await kmClient.storage.upload(file.name, file, [
				'logo',
				'brand'
			]);

			// Delete old logo if exists
			const oldLogoId = gameConfigStore.proxy.logoId;
			if (oldLogoId) {
				try {
					await kmClient.storage.deleteUpload(oldLogoId);
				} catch (error) {
					console.warn('Failed to delete old logo:', error);
				}
			}

			// Update store with new logo
			await kmClient.transact([gameConfigStore], ([state]) => {
				state.logoUrl = upload.url;
				state.logoId = upload.id;
			});
		} catch (error) {
			console.error('Failed to upload logo:', error);
			alert('Failed to upload logo');
		} finally {
			setIsUploadingLogo(false);
			// Reset input
			e.target.value = '';
		}
	};

	const handleEventTypeChange = async (newEventType: string) => {
		setSelectedEventType(newEventType);
		const eventTypeConfig = config.eventTypes[newEventType] as
			| { name: string; questions: FeedbackQuestion[] }
			| undefined;
		if (eventTypeConfig) {
			const newQuestions = eventTypeConfig.questions;
			setEditedQuestions(newQuestions);
			await feedbackActions.initializeFeedback(
				newEventType,
				newQuestions,
				isAnonymous
			);
		}
	};

	const handleQuestionChange = (index: number, text: string) => {
		const updated = editedQuestions.map((q, i) =>
			i === index ? { ...q, text } : q
		);
		setEditedQuestions(updated);
	};

	const handleAddQuestion = (type: 'rating' | 'text') => {
		setEditedQuestions([...editedQuestions, { text: '', type }]);
	};

	const handleRemoveQuestion = (index: number) => {
		setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
	};

	const handleSaveQuestions = async () => {
		if (editedQuestions.length === 0) {
			alert('Please add at least one question');
			return;
		}
		await feedbackActions.updateQuestions(editedQuestions);
		alert('Questions updated');
	};

	const handleInitializeFeedback = async () => {
		if (!selectedEventType) {
			alert('Please select an event type');
			return;
		}
		await feedbackActions.initializeFeedback(
			selectedEventType,
			editedQuestions,
			isAnonymous
		);
		alert('Feedback configured');
	};

	const eventTypeEntries = Object.entries(config.eventTypes);

	return (
		<div className="space-y-6">
			{/* Game Duration & Presenter QR */}
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<label htmlFor="duration" className="text-sm font-medium">
						{config.gameDurationLabel}:
					</label>
					<input
						type="number"
						id="duration"
						min={1}
						max={60}
						value={gameDuration}
						onChange={(e) =>
							gameConfigActions.changeGameDuration(Number(e.target.value))
						}
						disabled={started}
						className="km-input w-24"
					/>
				</div>

				<button
					type="button"
					className={showPresenterQr ? 'km-btn-neutral' : 'km-btn-secondary'}
					onClick={gameConfigActions.togglePresenterQr}
				>
					{config.togglePresenterQrButton}
				</button>
			</div>

			{/* Logo Upload */}
			<div className="space-y-3 border-t border-slate-200 pt-6">
				<h3 className="font-medium text-slate-900">{config.uploadLogoLabel}</h3>
				<div className="flex items-center gap-3">
					<label className="km-btn-secondary cursor-pointer">
						<Upload className="size-5" />
						Choose File
						<input
							type="file"
							accept="image/*"
							onChange={handleLogoUpload}
							disabled={isUploadingLogo}
							className="hidden"
						/>
					</label>
					{isUploadingLogo && <span>Uploading...</span>}
				</div>

				{logoUrl && logoUrl.trim() && (
					<div className="space-y-2">
						<p className="text-sm text-slate-600">{config.currentLogoLabel}:</p>
						<img
							src={logoUrl}
							alt="Event Logo"
							className="h-16 object-contain"
						/>
					</div>
				)}
			</div>

			{/* Color Customization Section */}
			<div className="border-t border-slate-200 pt-6">
				<ColorCustomizationSection />
			</div>

			{/* Feedback Configuration */}
			<div className="space-y-4 border-t border-slate-200 pt-6">
				<button
					type="button"
					onClick={() => setShowFeedbackConfig(!showFeedbackConfig)}
					className="km-btn-secondary flex w-full items-center justify-between"
				>
					Configure Feedback
					<ChevronDown
						className={cn(
							'size-5 transition-transform',
							showFeedbackConfig && 'rotate-180'
						)}
					/>
				</button>

				{showFeedbackConfig && (
					<div className="space-y-4 rounded-lg bg-slate-50 p-4">
						{/* Event Type Selection */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{config.selectEventTypeLabel}
							</label>
							<select
								value={selectedEventType}
								onChange={(e) => handleEventTypeChange(e.target.value)}
								disabled={started}
								className="km-input"
							>
								<option value="">Select event type...</option>
								{eventTypeEntries.map(([key, eventConfig]) => {
									const config_ = eventConfig as { name: string };
									return (
										<option key={key} value={key}>
											{config_.name}
										</option>
									);
								})}
							</select>
						</div>

						{/* AI Question Generator Component */}
						<AIQuestionGenerator
							selectedEventType={selectedEventType}
							existingQuestions={editedQuestions}
							onGenerationComplete={() => setShowGeneratedPreview(true)}
						/>

						{/* Anonymous Toggle */}
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="anonymousToggle"
								checked={isAnonymous}
								onChange={(e) => setIsAnonymous(e.target.checked)}
								disabled={started}
								className="rounded"
							/>
							<label
								htmlFor="anonymousToggle"
								className="text-sm text-slate-600"
							>
								{config.feedbackAnonymousLabel}
							</label>
						</div>

						{/* Question Editor */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Questions</p>
								<span className="text-xs text-slate-500">
									{editedQuestions.length} question
									{editedQuestions.length !== 1 ? 's' : ''}
								</span>
							</div>

							{editedQuestions.length > 0 && (
								<div className="max-h-72 space-y-3 overflow-y-auto">
									{editedQuestions.map((question, idx) => (
										<div
											key={idx}
											className="space-y-1 rounded border border-slate-300 bg-white p-3"
										>
											<div className="flex items-center justify-between">
												<label className="text-xs font-medium text-slate-600">
													Q{idx + 1} (
													<select
														value={question.type}
														onChange={(e) => {
															const updated = editedQuestions.map((q, i) =>
																i === idx
																	? {
																			...q,
																			type: e.target.value as 'rating' | 'text'
																		}
																	: q
															);
															setEditedQuestions(updated);
														}}
														disabled={started}
														className="rounded border border-slate-200 px-1 py-0 text-xs"
													>
														<option value="rating">rating</option>
														<option value="text">text</option>
													</select>
													)
												</label>
												<button
													type="button"
													onClick={() => handleRemoveQuestion(idx)}
													disabled={started}
													className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
												>
													✕
												</button>
											</div>
											<textarea
												value={question.text}
												onChange={(e) =>
													handleQuestionChange(idx, e.target.value)
												}
												disabled={started}
												placeholder="Question text..."
												className="km-input text-sm"
												rows={2}
											/>
										</div>
									))}
								</div>
							)}

							{/* Add Question Buttons */}
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => handleAddQuestion('rating')}
									disabled={started}
									className="km-btn-secondary flex-1 text-sm"
								>
									+ Add Rating
								</button>
								<button
									type="button"
									onClick={() => handleAddQuestion('text')}
									disabled={started}
									className="km-btn-secondary flex-1 text-sm"
								>
									+ Add Text
								</button>
							</div>
						</div>
						{/* Response Counter */}
						{feedbackResponses && (
							<div className="rounded bg-blue-50 p-3">
								<p className="text-xs text-slate-600">
									{config.responseCounterLabel}
								</p>
								<span
									ref={counterRef}
									className="text-2xl font-bold text-blue-600"
								>
									{Object.keys(feedbackResponses).length}
								</span>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-2 pt-2">
							<button
								type="button"
								onClick={handleSaveQuestions}
								disabled={started || !selectedEventType}
								className="km-btn-secondary flex-1"
							>
								Save Questions
							</button>
							<button
								type="button"
								onClick={handleInitializeFeedback}
								disabled={started || !selectedEventType}
								className="km-btn-primary flex-1"
							>
								Setup Feedback
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Generated Questions Preview Modal */}
			{showGeneratedPreview && generatedQuestions.length > 0 && (
				<GeneratedQuestionsPreview
					onClose={() => setShowGeneratedPreview(false)}
				/>
			)}
		</div>
	);
}
