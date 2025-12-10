interface ReadingProgress {
	page: string;
	sectionId: string;
	sectionTitle: string;
	timestamp: number;
	progress: number; // 0-100
}

const STORAGE_KEY = "reading-progress";

class ReadingProgressStore {
	current = $state<ReadingProgress | null>(null);

	constructor() {
		// Load from localStorage on init (client-side only)
		if (typeof window !== "undefined") {
			this.load();
		}
	}

	private load() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				this.current = JSON.parse(stored);
			}
		} catch (error) {
			console.error("Failed to load reading progress:", error);
		}
	}

	private save() {
		if (typeof window !== "undefined" && this.current) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current));
			} catch (error) {
				console.error("Failed to save reading progress:", error);
			}
		}
	}

	update(page: string, sectionId: string, sectionTitle: string, progress: number) {
		this.current = {
			page,
			sectionId,
			sectionTitle,
			timestamp: Date.now(),
			progress: Math.round(progress),
		};
		this.save();
	}

	clear() {
		this.current = null;
		if (typeof window !== "undefined") {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	getResumeUrl(): string | null {
		if (!this.current) return null;
		return `${this.current.page}#${this.current.sectionId}`;
	}
}

export const readingProgress = new ReadingProgressStore();
