/**
 * Date formatting utilities
 */

/**
 * Format a date string or Date object to YYYY-MM-DD
 * @param dateStr - Date string, Date object, or any date-like value
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDate(dateStr: string | Date | undefined | null): string {
	// Handle empty/null values
	if (!dateStr) return '';

	// If already in YYYY-MM-DD format, return as-is
	if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		return dateStr;
	}

	// Parse and format to YYYY-MM-DD
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) {
		// Return original if invalid (fallback)
		return typeof dateStr === 'string' ? dateStr : '';
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

/**
 * Parse a date string to a Date object
 * @param dateStr - Date string
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string | Date | undefined | null): Date | null {
	if (!dateStr) return null;
	if (dateStr instanceof Date) return dateStr;

	const date = new Date(dateStr);
	return isNaN(date.getTime()) ? null : date;
}

/**
 * Compare two dates for sorting (newest first)
 * @param a - First date
 * @param b - Second date
 * @returns Negative if b > a, positive if a > b, 0 if equal
 */
export function compareDatesDesc(
	a: string | Date | undefined | null,
	b: string | Date | undefined | null
): number {
	const dateA = parseDate(a);
	const dateB = parseDate(b);

	if (!dateA && !dateB) return 0;
	if (!dateA) return 1;
	if (!dateB) return -1;

	return dateB.getTime() - dateA.getTime();
}
