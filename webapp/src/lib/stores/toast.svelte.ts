type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

class ToastStore {
	toasts = $state<Toast[]>([]);

	add(message: string, type: ToastType = "info", duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: Toast = { id, message, type, duration };

		this.toasts.push(toast);

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}

		return id;
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	success(message: string, duration = 3000) {
		return this.add(message, "success", duration);
	}

	error(message: string, duration = 4000) {
		return this.add(message, "error", duration);
	}

	info(message: string, duration = 3000) {
		return this.add(message, "info", duration);
	}

	warning(message: string, duration = 3500) {
		return this.add(message, "warning", duration);
	}
}

export const toast = new ToastStore();
