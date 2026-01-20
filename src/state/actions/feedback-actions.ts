import { kmClient } from '@/services/km-client';
import {
	feedbackStore,
	type FeedbackQuestion,
	type FeedbackState,
	type PlayerFeedbackResponse
} from '../stores/feedback-store';

/**
 * Actions for feedback collection mutations.
 *
 * Handles feedback state changes, player responses, and data aggregation.
 */
export const feedbackActions = {
	/**
	 * Initialize feedback collection for an event type
	 * Called by host when setting up feedback
	 */
	async initializeFeedback(
		eventType: string,
		questions: FeedbackQuestion[],
		anonymousMode: boolean
	) {
		await kmClient.transact([feedbackStore], ([state]) => {
			state.eventType = eventType;
			state.questions = questions;
			state.anonymousMode = anonymousMode;
			state.collectionActive = true;
		});
	},

	/**
	 * Submit feedback response from a player
	 * Creates or updates response for current player
	 */
	async submitFeedback(
		ratings: Record<string, number>,
		textResponses: Record<string, string>
	) {
		await kmClient.transact([feedbackStore], ([state]) => {
			const response: PlayerFeedbackResponse = {
				ratings,
				textResponses,
				submittedAt: kmClient.serverTimestamp()
			};
			state.feedbackResponses[kmClient.id] = response;
		});
	},

	/**
	 * Edit existing feedback response (only before editableUntil)
	 */
	async editFeedback(
		ratings: Record<string, number>,
		textResponses: Record<string, string>
	) {
		await kmClient.transact([feedbackStore], ([state]) => {
			const response: PlayerFeedbackResponse = {
				ratings,
				textResponses,
				submittedAt: kmClient.serverTimestamp()
			};
			state.feedbackResponses[kmClient.id] = response;
		});
	},

	/**
	 * Update questions (host-editable)
	 */
	async updateQuestions(questions: FeedbackQuestion[]) {
		await kmClient.transact([feedbackStore], ([state]) => {
			state.questions = questions;
		});
	},

	/**
	 * Set the deadline for editing responses
	 */
	async setEditableUntil(timestamp: number) {
		await kmClient.transact([feedbackStore], ([state]) => {
			state.editableUntil = timestamp;
		});
	},

	/**
	 * Clear all feedback data (on new game)
	 */
	async clearFeedback() {
		await kmClient.transact([feedbackStore], ([state]) => {
			state.eventType = '';
			state.questions = [];
			state.feedbackResponses = {};
			state.collectionActive = false;
			state.editableUntil = 0;
		});
	},

	/**
	 * Switch presenter view
	 */
	async switchPresenterView(view: 'live' | 'analysis' | 'insights') {
		await kmClient.transact([feedbackStore], ([state]) => {
			state.presenterView = view;
			state.presenterAutoRotateTimestamp = kmClient.serverTimestamp();
		});
	},

	/**
	 * Get aggregated feedback data for display
	 */
	getAggregatedData(state: FeedbackState) {
		const { questions, feedbackResponses } = state;
		const totalResponses = Object.keys(feedbackResponses).length;

		// Calculate rating averages and distributions
		const ratingStats: Record<
			string,
			{ average: number; distribution: Record<number, number> }
		> = {};
		const allTextResponses: string[] = [];

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

				ratingStats[qIndexStr] = { average, distribution };
			} else if (question.type === 'text') {
				Object.values(feedbackResponses).forEach((r) => {
					const text = r.textResponses[qIndexStr];
					if (text && text.trim()) {
						allTextResponses.push(text);
					}
				});
			}
		});

		return {
			totalResponses,
			respondedCount: totalResponses,
			ratingStats,
			allTextResponses
		};
	}
};
