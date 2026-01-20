/**
 * Generate CSV content from feedback responses
 */
export function generateCsvContent(
	_eventType: string,
	questions: Array<{ text: string; type: 'rating' | 'text' }>,
	feedbackResponses: Record<
		string,
		{
			ratings: Record<string, number>;
			textResponses: Record<string, string>;
			submittedAt: number;
		}
	>,
	anonymousMode: boolean
): string {
	const headers = [
		'Respondent',
		...questions.map((_, i) => `Question ${i + 1}`)
	];

	const rows: string[][] = [];

	// Add each response as a row
	Object.entries(feedbackResponses).forEach(([clientId, response]) => {
		const respondent = anonymousMode ? 'Anonymous' : clientId;
		const row: string[] = [respondent];

		questions.forEach((question, qIndex) => {
			const qIndexStr = qIndex.toString();

			if (question.type === 'rating') {
				const rating = response.ratings[qIndexStr];
				row.push(rating ? String(rating) : '');
			} else {
				const text = response.textResponses[qIndexStr];
				// Escape quotes and wrap in quotes
				const escaped = text ? `"${text.replace(/"/g, '""')}"` : '';
				row.push(escaped);
			}
		});

		rows.push(row);
	});

	// Build CSV content
	const headerLine = headers.map((h) => `"${h}"`).join(',');
	const dataLines = rows.map((row) => row.join(','));

	return [headerLine, ...dataLines].join('\n');
}

/**
 * Trigger CSV download in browser
 */
export function downloadCsv(content: string, eventType: string): void {
	const timestamp = new Date().toISOString().split('T')[0];
	const filename = `feedback-${eventType}-${timestamp}.csv`;

	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}
