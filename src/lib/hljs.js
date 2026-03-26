/**
 * Instance highlight.js pré-configurée avec les langages communs.
 * Utilisée pour la coloration syntaxique dans les pages de rendu
 * (BlogDetail, FormationParcours) — l'éditeur Tiptap utilise lowlight.
 *
 * Les grammars sont déjà dans le bundle via `createLowlight(common)` dans
 * RichTextEditor.jsx — aucun code supplémentaire n'est ajouté.
 */
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
 * Applique la coloration syntaxique à tous les blocs <pre><code> dans un
 * élément conteneur. Ignore les blocs déjà traités (data-highlighted).
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
 * Parse une chaîne HTML, applique la coloration syntaxique sur tous les
 * blocs <pre><code>, et retourne le HTML résultant.
 *
 * Utilisation : const html = parseAndHighlight(rawHtml)
 * puis <div dangerouslySetInnerHTML={{ __html: html }} />
 *
 * @param {string} html
 * @returns {string}
 */
export function parseAndHighlight(html) {
  if (!html) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
  return doc.body.innerHTML;
}
