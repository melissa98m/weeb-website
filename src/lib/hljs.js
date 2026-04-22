/**
 * Pre-configured highlight.js instance with common languages.
 * Used for syntax highlighting in rendering pages
 * (BlogDetail, FormationParcours) — the Tiptap editor uses lowlight instead.
 *
 * Language grammars are already bundled via `createLowlight(common)` in
 * RichTextEditor.jsx — no extra code is loaded here.
 */
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("css", css);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("php", php);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);

hljs.configure({ ignoreUnescapedHTML: true });

/**
 * Applies syntax highlighting to all <pre><code> blocks inside a container.
 * Skips blocks that have already been processed (data-highlighted).
 *
 * @param {HTMLElement|null} container
 */
export function highlightContainer(container) {
  if (!container) return;
  container.querySelectorAll("pre code").forEach((block) => {
    if (!block.dataset.highlighted) {
      hljs.highlightElement(block);
    }
  });
}

/**
 * Parses an HTML string, applies syntax highlighting to all <pre><code>
 * blocks, and returns the resulting HTML.
 *
 * Usage: const html = parseAndHighlight(rawHtml)
 * then <div dangerouslySetInnerHTML={{ __html: html }} />
 *
 * @param {string} html
 * @returns {string}
 */
export function parseAndHighlight(html) {
  if (!html) return html;
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  const doc = new DOMParser().parseFromString(clean, "text/html");
  doc.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
  return doc.body.innerHTML;
}
