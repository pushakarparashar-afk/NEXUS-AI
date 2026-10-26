import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatShortDate(dateStr);
  } catch {
    return dateStr;
  }
}

export function formatTimeRemaining(targetIso: string): {
  text: string;
  isOverdue: boolean;
  minutesRemaining: number;
} {
  try {
    const now = Date.now();
    const target = new Date(targetIso).getTime();
    const diffMs = target - now;
    const isOverdue = diffMs < 0;
    const absMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    let text = '';
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      text = isOverdue ? `${days}d ${hours % 24}h overdue` : `${days}d ${hours % 24}h left`;
    } else if (hours > 0) {
      text = isOverdue ? `${hours}h ${mins}m overdue` : `${hours}h ${mins}m left`;
    } else {
      text = isOverdue ? `${mins}m overdue` : `${mins}m left`;
    }

    return {
      text,
      isOverdue,
      minutesRemaining: Math.floor(diffMs / (1000 * 60)),
    };
  } catch {
    return { text: 'N/A', isOverdue: false, minutesRemaining: 0 };
  }
}

export function generateTicketId(existingTickets: { id: string }[]): string {
  const numbers = existingTickets
    .map(t => {
      const match = t.id.match(/NX-(\d+)/);
      return match ? parseInt(match[1], 10) : 1000;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
  return `NX-${max + 1}`;
}
