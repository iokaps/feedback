import { kmClient } from '@/services/km-client';

export interface FeedbackQuestion {
	text: string;
	type: 'rating' | 'text';
}

export interface PlayerFeedbackResponse {
	ratings: Record<string, number>; // questionIndex -> rating (1-5)
	textResponses: Record<string, string>; // questionIndex -> text
	submittedAt: number; // timestamp
}

export interface FeedbackState {
	eventType: string;
	questions: FeedbackQuestion[];
	anonymousMode: boolean;
	feedbackResponses: Record<string, PlayerFeedbackResponse>; // clientId -> response
	collectionActive: boolean;
	editableUntil: number; // timestamp when editing closes
	presenterView: 'live' | 'analysis' | 'insights';
	presenterAutoRotateTimestamp: number;
	uploadedFileContent: string; // raw file text for AI processing
	generatedQuestions: FeedbackQuestion[]; // AI-generated questions pending review
	isGeneratingQuestions: boolean; // loading state during AI generation
	fileUploadError: string; // error message if file upload/parsing fails
}

const initialState: FeedbackState = {
	eventType: '',
	questions: [],
	anonymousMode: true,
	feedbackResponses: {},
	collectionActive: false,
	editableUntil: 0,
	presenterView: 'live',
	presenterAutoRotateTimestamp: 0,
	uploadedFileContent: '',
	generatedQuestions: [],
	isGeneratingQuestions: false,
	fileUploadError: ''
};

/**
 * Domain: Feedback Collection
 *
 * Global store for post-event feedback state - synced across all clients.
 *
 * Use this store for:
 * - Event type and feedback questions (host-editable)
 * - Player feedback responses (ratings and text)
 * - Feedback collection state (active, editable until)
 * - Anonymous mode setting
 * - Presenter view state and auto-rotate timing
 *
 * @see feedbackActions for state mutations
 */
export const feedbackStore = kmClient.store<FeedbackState>(
	'feedback-collection',
	initialState
);
