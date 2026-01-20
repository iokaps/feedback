import { z } from '@kokimoki/kit';

export interface EventTypeConfig {
	name: string;
	questions: Array<{
		text: string;
		type: 'rating' | 'text';
	}>;
}

export const schema = z.object({
	// translations
	title: z.string().default('My Game'),

	gameLobbyMd: z
		.string()
		.default(
			'# Waiting for game to start...\nThe game will start once the host presses the start button.'
		),
	connectionsMd: z.string().default('# Connections example'),
	sharedStateMd: z
		.string()
		.default(
			'# Game in Progress\nHost dashboard with game controls and live player feedback.'
		),
	sharedStatePlayerMd: z
		.string()
		.default(
			'# Game in Progress\nWait for the host to end the game and collect your feedback.'
		),

	players: z.string().default('Players'),
	online: z.string().default('Online'),
	offline: z.string().default('Offline'),
	startButton: z.string().default('Start Game'),
	stopButton: z.string().default('Stop Game'),
	loading: z.string().default('Loading...'),

	menuHelpMd: z
		.string()
		.default('# Help\nInstructions on how to play the game.'),

	createProfileMd: z.string().default('# Create your player profile'),
	playerNamePlaceholder: z.string().default('Your name...'),
	playerNameLabel: z.string().default('Name:'),
	playerNameButton: z.string().default('Continue'),

	playerLinkLabel: z.string().default('Player Link'),
	presenterLinkLabel: z.string().default('Presenter Link'),

	togglePresenterQrButton: z.string().default('Toggle Presenter QR'),

	menuAriaLabel: z.string().default('Open menu drawer'),
	menuHelpAriaLabel: z.string().default('Open help drawer'),
	gameDurationLabel: z.string().default('Game Duration (mins)'),

	// Feedback configuration
	selectEventTypeLabel: z.string().default('Select Event Type'),
	eventTypes: z
		.record(
			z.string(),
			z.object({
				name: z.string(),
				questions: z.array(
					z.object({
						text: z.string(),
						type: z.enum(['rating', 'text'])
					})
				)
			})
		)
		.default({}),

	feedbackFormMd: z
		.string()
		.default(
			'# Please share your feedback\n\nYour honest feedback helps us improve!'
		),
	feedbackInstructionsMd: z
		.string()
		.default('Rate each aspect and optionally add comments.'),
	feedbackSubmitButton: z.string().default('Submit Feedback'),
	feedbackSkipButton: z.string().default('Skip'),
	feedbackAnonymousLabel: z.string().default('Submit anonymously'),
	feedbackEditableUntilLabel: z.string().default('Can edit until game ends'),

	exportCsvButton: z.string().default('Export as CSV'),
	responseCounterLabel: z.string().default('Responses'),
	ratingDistributionLabel: z.string().default('Rating Distribution'),
	feedbackResultsMd: z.string().default('# Feedback Results'),

	uploadLogoLabel: z.string().default('Upload Logo'),
	currentLogoLabel: z.string().default('Current Logo'),

	// Presenter view configuration
	presenterAutoRotateEnabled: z.boolean().default(true),
	presenterAutoRotateInterval: z.number().default(30),
	presenterLiveViewLabel: z.string().default('Live'),
	presenterAnalysisViewLabel: z.string().default('Analysis'),
	presenterInsightsViewLabel: z.string().default('Insights'),
	presenterWentWellLabel: z.string().default('✓ Went Well'),
	presenterImprovementLabel: z.string().default('💡 Improvement Ideas'),
	presenterNeutralLabel: z.string().default('→ Other Feedback'),
	presenterOverallSatisfactionLabel: z.string().default('Overall Satisfaction'),

	// Color Customization
	colorCustomizationLabel: z.string().default('Customize Game Colors'),
	colorPresetsLabel: z.string().default('Quick Themes'),
	advancedColorsLabel: z.string().default('Advanced Colors'),
	resetColorsButton: z.string().default('Reset to Default'),
	customPresetLabel: z.string().default('Custom'),
	gameSetupLabel: z.string().default('Game Setup'),

	// AI Question Generation
	uploadEventFileLabel: z.string().default('Upload Event File'),
	generateQuestionsButton: z.string().default('Generate Questions from File'),
	generatingQuestionsLabel: z.string().default('Generating questions...'),
	useGeneratedQuestionsButton: z.string().default('Use Generated Questions'),
	mergeQuestionsButton: z.string().default('Merge with Existing'),
	discardQuestionsButton: z.string().default('Discard'),
	fileUploadErrorLabel: z.string().default('Error uploading file')
});

export type Config = z.infer<typeof schema>;
