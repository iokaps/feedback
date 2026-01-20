import { config } from '@/config';
import { feedbackAiActions } from '@/state/actions/feedback-ai-actions';
import {
	feedbackStore,
	type FeedbackQuestion
} from '@/state/stores/feedback-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { Upload, Wand2, X } from 'lucide-react';
import React from 'react';

interface AIQuestionGeneratorProps {
	selectedEventType: string;
	existingQuestions: FeedbackQuestion[];
	onGenerationComplete: () => void;
}

export function AIQuestionGenerator({
	selectedEventType,
	existingQuestions,
	onGenerationComplete
}: AIQuestionGeneratorProps) {
	const { isGeneratingQuestions, fileUploadError, uploadedFileContent } =
		useSnapshot(feedbackStore.proxy);
	const [activeTab, setActiveTab] = React.useState<'input' | 'file'>('input');
	const [userInput, setUserInput] = React.useState('');
	const [uploadedFileName, setUploadedFileName] = React.useState('');

	const handleGenerateFromInput = async () => {
		if (!selectedEventType) {
			alert('Please select an event type first');
			return;
		}

		if (!userInput.trim()) {
			alert('Please enter an event description');
			return;
		}

		try {
			await feedbackAiActions.generateQuestionsFromInput(
				selectedEventType,
				userInput,
				existingQuestions
			);
			onGenerationComplete();
		} catch (error) {
			console.error('Generation error:', error);
		}
	};

	const handleEventFileUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadedFileName(file.name);
		try {
			await feedbackAiActions.uploadAndParseFile(file);
		} catch (error) {
			console.error('File upload error:', error);
		}
		e.target.value = '';
	};

	const handleGenerateFromFile = async () => {
		if (!uploadedFileContent) {
			alert('Please upload a file first');
			return;
		}

		try {
			await feedbackAiActions.generateQuestionsFromFile(
				selectedEventType,
				uploadedFileContent,
				existingQuestions
			);
			onGenerationComplete();
		} catch (error) {
			console.error('Question generation error:', error);
		}
	};

	const handleClearUploadedFile = () => {
		setUploadedFileName('');
		// Clear file content from store
		feedbackStore.proxy.uploadedFileContent = '';
	};

	return (
		<div className="border-primary/20 space-y-3 rounded-lg border bg-white p-4">
			<div className="flex items-center gap-2">
				<Wand2 className="text-primary size-4" />
				<h4 className="text-text-dark text-sm font-semibold">
					AI Question Generator
				</h4>
			</div>

			{/* Tab Buttons */}
			<div className="border-secondary-light flex gap-2 border-b">
				<button
					onClick={() => setActiveTab('input')}
					className={cn(
						'px-3 py-2 text-sm font-medium transition-colors',
						activeTab === 'input'
							? 'border-primary text-primary border-b-2'
							: 'text-secondary hover:text-text-dark'
					)}
				>
					From Description
				</button>
				<button
					onClick={() => setActiveTab('file')}
					className={cn(
						'px-3 py-2 text-sm font-medium transition-colors',
						activeTab === 'file'
							? 'border-primary text-primary border-b-2'
							: 'text-secondary hover:text-text-dark'
					)}
				>
					From File
				</button>
			</div>

			{/* Input Tab */}
			{activeTab === 'input' && (
				<div className="space-y-3">
					<div className="space-y-2">
						<label className="text-xs font-medium text-slate-600">
							Event Description (Optional)
						</label>
						<textarea
							value={userInput}
							onChange={(e) => setUserInput(e.target.value)}
							placeholder={`Describe your ${selectedEventType || 'event'} to help generate relevant questions...`}
							className="km-input text-sm"
							rows={4}
						/>
						<p className="text-xs text-slate-500">
							Tip: Include key activities, goals, or topics covered
						</p>
					</div>

					{fileUploadError && (
						<div className="bg-danger-light rounded p-2">
							<p className="text-danger text-xs">{fileUploadError}</p>
						</div>
					)}

					<button
						onClick={handleGenerateFromInput}
						disabled={isGeneratingQuestions}
						className="km-btn-primary w-full text-sm"
					>
						{isGeneratingQuestions ? (
							<>
								<span className="mr-2 inline-block animate-spin">⏳</span>
								Generating...
							</>
						) : (
							<>
								<Wand2 className="size-4" />
								Generate Questions
							</>
						)}
					</button>
				</div>
			)}

			{/* File Tab */}
			{activeTab === 'file' && (
				<div className="space-y-3">
					<div className="space-y-2">
						<label className="text-xs font-medium text-slate-600">
							{config.uploadEventFileLabel}
						</label>
						<label className="km-btn-secondary inline-flex cursor-pointer">
							<Upload className="size-4" />
							Choose File (.txt or .pdf)
							<input
								type="file"
								accept=".txt,.pdf"
								onChange={handleEventFileUpload}
								disabled={isGeneratingQuestions}
								className="hidden"
							/>
						</label>

						{/* Uploaded file info */}
						{uploadedFileName && (
							<div className="bg-success-light flex items-center justify-between rounded p-2">
								<span className="text-success text-xs">
									✓ {uploadedFileName}
								</span>
								<button
									type="button"
									onClick={handleClearUploadedFile}
									className="text-success hover:text-success-light"
								>
									<X className="size-4" />
								</button>
							</div>
						)}

						{fileUploadError && (
							<div className="bg-danger-light rounded p-2">
								<p className="text-danger text-xs">{fileUploadError}</p>
							</div>
						)}
					</div>

					<button
						onClick={handleGenerateFromFile}
						disabled={!uploadedFileName || isGeneratingQuestions}
						className="km-btn-primary w-full text-sm"
					>
						{isGeneratingQuestions ? (
							<>
								<span className="mr-2 inline-block animate-spin">⏳</span>
								Generating...
							</>
						) : (
							<>
								<Wand2 className="size-4" />
								{config.generateQuestionsButton}
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
}
