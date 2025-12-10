import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml utility", () => {
    describe("Safe HTML", () => {
        it("should preserve safe paragraph tags", () => {
            const input = "<p>Safe paragraph</p>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<p>Safe paragraph</p>");
        });

        it("should preserve multiple paragraphs", () => {
            const input = "<p>First</p><p>Second</p>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<p>First</p><p>Second</p>");
        });

        it("should preserve strong tags", () => {
            const input = "<p><strong>Bold text</strong></p>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<p><strong>Bold text</strong></p>");
        });

        it("should preserve em tags", () => {
            const input = "<p><em>Italic text</em></p>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<p><em>Italic text</em></p>");
        });

        it("should preserve links with allowed attributes", () => {
            const input = '<a href="https://example.com">Link</a>';
            const output = sanitizeHtml(input);
            expect(output).toContain("https://example.com");
            expect(output).toContain("Link");
        });

        it("should preserve lists", () => {
            const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
            const output = sanitizeHtml(input);
            expect(output).toContain("<ul>");
            expect(output).toContain("<li>");
            expect(output).toContain("Item 1");
        });

        it("should preserve headings", () => {
            const input = "<h2>Heading</h2>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<h2>Heading</h2>");
        });

        it("should preserve blockquotes", () => {
            const input = "<blockquote>Quote</blockquote>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<blockquote>Quote</blockquote>");
        });

        it("should preserve code blocks", () => {
            const input = "<pre><code>const x = 1;</code></pre>";
            const output = sanitizeHtml(input);
            expect(output).toContain("<code>");
            expect(output).toContain("const x = 1;");
        });
    });

    describe("Dangerous HTML Removal", () => {
        it("should remove script tags", () => {
            const input = '<p>Safe</p><script>alert("XSS")</script>';
            const output = sanitizeHtml(input);
            expect(output).toBe("<p>Safe</p>");
            expect(output).not.toContain("script");
            expect(output).not.toContain("alert");
        });

        it("should remove inline event handlers", () => {
            const input = '<p onclick="alert(\'XSS\')">Click me</p>';
            const output = sanitizeHtml(input);
            expect(output).toBe("<p>Click me</p>");
            expect(output).not.toContain("onclick");
        });

        it("should remove javascript: URLs", () => {
            const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
            const output = sanitizeHtml(input);
            expect(output).not.toContain("javascript:");
        });

        it("should remove style tags", () => {
            const input = "<style>body { display: none; }</style><p>Text</p>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<p>Text</p>");
            expect(output).not.toContain("style");
        });

        it("should remove iframe tags", () => {
            const input = '<iframe src="malicious.com"></iframe>';
            const output = sanitizeHtml(input);
            expect(output).toBe("");
        });

        it("should remove object and embed tags", () => {
            const input = '<object data="file.swf"></object>';
            const output = sanitizeHtml(input);
            expect(output).toBe("");
        });

        it("should remove data attributes", () => {
            const input = '<p data-secret="value">Text</p>';
            const output = sanitizeHtml(input);
            expect(output).toBe("<p>Text</p>");
            expect(output).not.toContain("data-secret");
        });
    });

    describe("Academic Content", () => {
        it("should handle typical thesis content", () => {
            const input = `
                <p>Mit der Veröffentlichung von ChatGPT wurde eine <strong>technologische Wende</strong> eingeleitet.</p>
                <p>Diese Entwicklung zeigt sich in <em>mehreren Aspekten</em>:</p>
                <ul>
                    <li>Nutzerzahlen</li>
                    <li>Anwendungsfälle</li>
                </ul>
            `;
            const output = sanitizeHtml(input);
            expect(output).toContain("ChatGPT");
            expect(output).toContain("<strong>");
            expect(output).toContain("<em>");
            expect(output).toContain("<ul>");
            expect(output).toContain("<li>");
        });

        it("should preserve allowed class attributes", () => {
            const input = '<p class="text-muted">Muted text</p>';
            const output = sanitizeHtml(input);
            expect(output).toContain('class="text-muted"');
        });

        it("should preserve links with target attribute", () => {
            const input =
                '<a href="https://example.com" target="_blank">External</a>';
            const output = sanitizeHtml(input);
            expect(output).toContain('target="_blank"');
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty string", () => {
            const output = sanitizeHtml("");
            expect(output).toBe("");
        });

        it("should handle plain text without tags", () => {
            const input = "Just plain text";
            const output = sanitizeHtml(input);
            expect(output).toBe("Just plain text");
        });

        it("should handle malformed HTML gracefully", () => {
            const input = "<p>Unclosed paragraph";
            const output = sanitizeHtml(input);
            expect(output).toContain("Unclosed paragraph");
        });

        it("should handle nested tags", () => {
            const input = "<p><strong><em>Nested</em></strong></p>";
            const output = sanitizeHtml(input);
            expect(output).toBe("<p><strong><em>Nested</em></strong></p>");
        });

        it("should handle special characters", () => {
            const input = "<p>&lt;script&gt; &amp; &quot;quotes&quot;</p>";
            const output = sanitizeHtml(input);
            expect(output).toContain("&lt;script&gt;");
            expect(output).toContain("&amp;");
        });
    });

    describe("Security", () => {
        it("should prevent XSS via img onerror", () => {
            const input = '<img src="x" onerror="alert(\'XSS\')">';
            const output = sanitizeHtml(input);
            expect(output).not.toContain("onerror");
            expect(output).not.toContain("alert");
        });

        it("should prevent XSS via data URIs", () => {
            const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
            const output = sanitizeHtml(input);
            expect(output).not.toContain("data:text/html");
        });

        it("should prevent SVG-based XSS", () => {
            const input = '<svg><script>alert(1)</script></svg>';
            const output = sanitizeHtml(input);
            expect(output).not.toContain("<svg>");
            expect(output).not.toContain("alert");
        });
    });
});
