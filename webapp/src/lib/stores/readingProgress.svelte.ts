interface ReadingState {
	current: {
		page: string;
		sectionId: string;
		sectionTitle: string;
		timestamp: number;
		progress: number; // 0-100
	} | null;
	sectionProgress: Record<string, number>; // Max progress per section (0-100)
}

const STORAGE_KEY = "reading-progress";

class ReadingProgressStore {
	state = $state<ReadingState>({
		current: null,
		sectionProgress: {},
	});

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
				const parsed = JSON.parse(stored);
				// Handle migration
				if (parsed.current || parsed.sectionProgress) {
					this.state = parsed;
				} else if (parsed.completedSections) {
					// Migrate from completedSections to sectionProgress
					const sectionProgress: Record<string, number> = {};
					for (const [id, completed] of Object.entries(parsed.completedSections)) {
						if (completed) sectionProgress[id] = 100;
					}
					this.state = {
						current: parsed.current,
						sectionProgress
					};
				} else {
					// Migration from old simple object
					this.state = {
						current: parsed,
						sectionProgress: {},
					};
				}
			}
		} catch (error) {
			console.error("Failed to load reading progress:", error);
		}
	}

	private save() {
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
			} catch (error) {
				console.error("Failed to save reading progress:", error);
			}
		}
	}

	update(page: string, sectionId: string, sectionTitle: string, progress: number) {
		const roundedProgress = Math.round(progress);

		this.state.current = {
			page,
			sectionId,
			sectionTitle,
			timestamp: Date.now(),
			progress: roundedProgress,
		};

		// Update max progress for this section
		const currentMax = this.state.sectionProgress[sectionId] || 0;
		if (roundedProgress > currentMax) {
			this.state.sectionProgress[sectionId] = roundedProgress;
		}

		this.save();
	}

	getProgress(sectionId: string): number {
		return this.state.sectionProgress[sectionId] || 0;
	}

	clear() {
		this.state = { current: null, sectionProgress: {} };
		if (typeof window !== "undefined") {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	getResumeUrl(): string | null {
		if (!this.state.current) return null;
		// If we are on the separate pages structure, we might want to return the full path
		// But for now, let's keep it simple or adapt based on `page` context
		if (this.state.current.page === '/vorstudie' && this.state.current.sectionId) {
			return `/vorstudie/${this.state.current.sectionId}`;
		}
		return `${this.state.current.page}#${this.state.current.sectionId}`;
	}
}

export const readingProgress = new ReadingProgressStore();
