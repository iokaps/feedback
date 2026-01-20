import { kmClient } from '@/services/km-client';
import { parseFile } from '@/utils/parse-file';
import { feedbackStore, type FeedbackQuestion } from '../stores/feedback-store';

/**
 * Actions for AI-powered feedback question generation from uploaded files
 */
export const feedbackAiActions = {
	/**
	 * Upload and parse file, storing content for AI processing
	 *
	 * @param file File to upload (txt or pdf)
	 * @throws Error if file parsing fails
	 */
	async uploadAndParseFile(file: File) {
		try {
			await kmClient.transact([feedbackStore], ([state]) => {
				state.isGeneratingQuestions = true;
				state.fileUploadError = '';
			});

			const fileContent = await parseFile(file);

			await kmClient.transact([feedbackStore], ([state]) => {
				state.uploadedFileContent = fileContent;
				state.isGeneratingQuestions = false;
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to parse file';
			await kmClient.transact([feedbackStore], ([state]) => {
				state.fileUploadError = errorMessage;
				state.isGeneratingQuestions = false;
			});
			throw error;
		}
	},

	/**
	 * Generate feedback questions from uploaded file content using AI
	 *
	 * @param eventType Selected event type for context
	 * @param fileContent File content to analyze
	 * @param existingQuestions Current questions (for consistency)
	 */
	async generateQuestionsFromFile(
		eventType: string,
		fileContent: string,
		existingQuestions: FeedbackQuestion[]
	) {
		try {
			await kmClient.transact([feedbackStore], ([state]) => {
				state.isGeneratingQuestions = true;
				state.fileUploadError = '';
			});

			const existingQuestionsText = existingQuestions
				.map((q, i) => `${i + 1}. [${q.type}] ${q.text}`)
				.join('\n');

			const prompt = `You are an expert event feedback designer. Based on the following event file content and existing questions, generate feedback questions in JSON format.

Event Type: ${eventType}

Event Details:
${fileContent}

Existing Questions (for reference and consistency):
${existingQuestionsText || 'None yet'}

Generate 3-5 NEW feedback questions in JSON format that are:
- Specific to this event
- Mix of rating (1-5 scale) and text questions
- Clear and concise
- Non-overlapping with existing questions

Return ONLY valid JSON with no additional text. Format:
{
  "questions": [
    {"text": "question text?", "type": "rating"},
    {"text": "question text?", "type": "text"}
  ]
}`;

			// Use the AI chat API to generate questions
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (kmClient.ai as any).chat({
				prompt
			});

			// Parse JSON response
			let generatedQuestions: FeedbackQuestion[] = [];
			try {
				// Extract JSON from response text
				const responseText =
					typeof response === 'string'
						? response
						: response.text || response.content || '';
				const jsonMatch = responseText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					const parsed = JSON.parse(jsonMatch[0]);
					generatedQuestions = (parsed.questions || []).filter(
						(q: { text?: string; type?: string }) =>
							typeof q.text === 'string' &&
							(q.type === 'rating' || q.type === 'text')
					);
				}
			} catch (parseError) {
				console.error('Failed to parse AI response:', parseError);
				throw new Error('Invalid response format from AI');
			}

			if (generatedQuestions.length === 0) {
				throw new Error('No valid questions generated');
			}

			await kmClient.transact([feedbackStore], ([state]) => {
				state.generatedQuestions = generatedQuestions;
				state.isGeneratingQuestions = false;
			});

			return generatedQuestions;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to generate questions';
			await kmClient.transact([feedbackStore], ([state]) => {
				state.fileUploadError = errorMessage;
				state.isGeneratingQuestions = false;
			});
			throw error;
		}
	},

	/**
	 * Apply generated questions to feedback questions
	 *
	 * @param action 'replace' - use only generated, 'merge' - combine with existing, 'discard' - clear generated
	 */
	async applyGeneratedQuestions(action: 'replace' | 'merge' | 'discard') {
		await kmClient.transact([feedbackStore], ([state]) => {
			if (action === 'replace') {
				state.questions = state.generatedQuestions;
			} else if (action === 'merge') {
				state.questions = [...state.questions, ...state.generatedQuestions];
			}
			// 'discard' does nothing, just clears generated

			state.generatedQuestions = [];
			state.uploadedFileContent = '';
			state.fileUploadError = '';
		});
	}
};
