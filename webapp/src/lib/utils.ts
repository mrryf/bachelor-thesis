import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export { throttle } from "./utils/throttle";
export { sanitizeHtml } from "./utils/sanitize";
