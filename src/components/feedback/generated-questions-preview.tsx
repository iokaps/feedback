import { config } from '@/config';
import { feedbackAiActions } from '@/state/actions/feedback-ai-actions';
import { feedbackStore } from '@/state/stores/feedback-store';
import { useSnapshot } from '@kokimoki/app';
import { Wand2, X } from 'lucide-react';

interface GeneratedQuestionsPreviewProps {
	onClose: () => void;
}

/**
 * Modal preview of AI-generated questions with merge/replace/discard options
 */
export function GeneratedQuestionsPreview({
	onClose
}: GeneratedQuestionsPreviewProps) {
	const { generatedQuestions, questions: existingQuestions } = useSnapshot(
		feedbackStore.proxy
	);

	const handleReplace = async () => {
		await feedbackAiActions.applyGeneratedQuestions('replace');
		onClose();
	};

	const handleMerge = async () => {
		await feedbackAiActions.applyGeneratedQuestions('merge');
		onClose();
	};

	const handleDiscard = async () => {
		await feedbackAiActions.applyGeneratedQuestions('discard');
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="bg-bg-card max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl">
				{/* Header */}
				<div className="from-primary sticky top-0 flex items-center justify-between bg-gradient-to-r to-cyan-500 p-6 text-white shadow-lg">
					<div className="flex items-center gap-3">
						<Wand2 className="size-6" />
						<div>
							<h2 className="text-lg font-bold">AI-Generated Questions</h2>
							<p className="text-sm opacity-90">
								{generatedQuestions.length} question
								{generatedQuestions.length !== 1 ? 's' : ''}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 transition-colors hover:bg-white/20"
					>
						<X className="size-5" />
					</button>
				</div>

				{/* Questions List */}
				<div className="space-y-4 p-6">
					{generatedQuestions.map((question, index) => (
						<div
							key={index}
							className="border-primary bg-primary-light/20 rounded-lg border-l-4 p-4"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex-1">
									<p className="text-text-dark font-medium">{question.text}</p>
									<span className="text-primary bg-primary-light mt-2 inline-block rounded px-2 py-1 text-xs font-semibold">
										{question.type === 'rating' ? '⭐ Rating' : '📝 Text'}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Existing Questions Summary */}
				{existingQuestions.length > 0 && (
					<div className="border-border bg-secondary-light border-t px-6 py-4">
						<p className="text-secondary text-sm font-medium">
							You have {existingQuestions.length} existing question
							{existingQuestions.length !== 1 ? 's' : ''}. Choose how to apply
							the generated questions:
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="border-border flex flex-wrap justify-end gap-3 border-t px-6 py-4">
					<button
						type="button"
						onClick={handleDiscard}
						className="km-btn-secondary"
					>
						{config.discardQuestionsButton}
					</button>

					{existingQuestions.length > 0 && (
						<button
							type="button"
							onClick={handleMerge}
							className="km-btn-secondary"
						>
							{config.mergeQuestionsButton}
						</button>
					)}

					<button
						type="button"
						onClick={handleReplace}
						className="km-btn-primary"
					>
						{config.useGeneratedQuestionsButton}
					</button>
				</div>
			</div>
		</div>
	);
}
