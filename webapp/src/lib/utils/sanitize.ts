import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks while allowing safe formatting.
 *
 * This function uses DOMPurify to clean HTML content, allowing only safe tags
 * and attributes commonly used in academic content (paragraphs, emphasis, links, etc.)
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML safe for rendering with {@html}
 *
 * @example
 * const clean = sanitizeHtml('<p>Safe content</p><script>alert("xss")</script>');
 * // Returns: '<p>Safe content</p>'
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "em",
            "u",
            "a",
            "ul",
            "ol",
            "li",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "blockquote",
            "code",
            "pre",
            "span",
        ],
        ALLOWED_ATTR: ["href", "target", "rel", "class"],
        ALLOW_DATA_ATTR: false,
    });
}
