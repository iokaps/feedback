/**
 * File parsing utility supporting text files
 * Extracts text content from uploaded files for AI processing
 */

const MAX_CONTENT_LENGTH = 5000;

/**
 * Parse uploaded file and extract text content
 * Supports .txt files
 *
 * @param file File object from input
 * @returns Extracted text content (truncated to MAX_CONTENT_LENGTH)
 * @throws Error if file format not supported or parsing fails
 */
export async function parseFile(file: File): Promise<string> {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith('.txt')) {
		return parseTxtFile(file);
	}

	if (fileName.endsWith('.pdf')) {
		return parsePdfFile(file);
	}

	throw new Error(
		`Unsupported file format: ${file.name}. Please upload a .txt file.`
	);
}

/**
 * Parse plain text file
 */
async function parseTxtFile(file: File): Promise<string> {
	const text = await file.text();
	return text.substring(0, MAX_CONTENT_LENGTH).trim();
}

/**
 * Parse PDF file - converts to text (basic support)
 * Note: Full PDF parsing requires pdfjs-dist. This is a placeholder.
 */
async function parsePdfFile(file: File): Promise<string> {
	try {
		// For now, read PDF as text - more robust PDF parsing requires pdfjs-dist
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		// Extract text from PDF binary (basic text extraction)
		let text = '';
		for (let i = 0; i < uint8Array.length; i++) {
			const byte = uint8Array[i];
			// Extract printable ASCII and common UTF-8 characters
			if ((byte >= 32 && byte <= 126) || byte >= 160) {
				text += String.fromCharCode(byte);
			} else if (byte === 10 || byte === 13) {
				text += '\n';
			}
		}

		return text.substring(0, MAX_CONTENT_LENGTH).trim();
	} catch (error) {
		throw new Error(
			`Failed to parse PDF file: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
