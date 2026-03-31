export function getUserMessage(error: string): string {
  const messages: Record<string, string> = {
    'Unauthorized': 'Please sign in to continue.',
    'Quote not found': "This quote doesn't exist or has been removed.",
    'Network Error': 'Check your internet connection and try again.',
    'Too many requests': 'Please wait a moment before trying again.',
    'Failed to fetch': 'Check your internet connection and try again.',
    'Save failed': 'Could not save your changes. Please try again.',
    'Failed to send quote': 'Could not send the quote. Please try again.',
    'Failed to resend': 'Could not resend the quote. Please try again.',
  };
  return messages[error] || 'Something went wrong. Please try again.';
}
