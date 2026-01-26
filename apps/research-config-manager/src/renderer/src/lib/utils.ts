import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}k`;
  }
  return tokens.toString();
}

export function shortenDocumentName(name: string, maxLength = 60): string {
  // Remove PDF extension
  const withoutExt = name.replace(/\.pdf$/i, '');

  if (withoutExt.length <= maxLength) {
    return withoutExt;
  }

  return withoutExt.slice(0, maxLength - 3) + '...';
}

export const TOKENS_PER_PAGE = 500;
