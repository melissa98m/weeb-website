import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Extension } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { ensureCsrf } from "../../lib/api";

/* ---- Languages supported by prettier (loaded dynamically) ---- */
const PRETTIER_PARSERS = {
  javascript: "babel",
  typescript: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  json: "json",
  yaml: "yaml",
};

async function formatWithPrettier(code, language) {
  const parser = PRETTIER_PARSERS[language];
  if (!parser || !code.trim()) return null;
  try {
    const prettier = await import("prettier/standalone");
    let plugins = [];
    if (parser === "babel" || parser === "json") {
      const [babel, estree] = await Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
      ]);
      plugins = [babel, estree];
    } else if (parser === "typescript") {
      const [babel, estree, ts] = await Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
        import("prettier/plugins/typescript"),
      ]);
      plugins = [babel, estree, ts];
    } else if (parser === "html") {
      plugins = [await import("prettier/plugins/html")];
    } else if (parser === "css") {
      plugins = [await import("prettier/plugins/postcss")];
    } else if (parser === "yaml") {
      plugins = [await import("prettier/plugins/yaml")];
    }
    const formatted = await prettier.format(code, { parser, plugins, tabWidth: 2, printWidth: 80 });
    return formatted;
  } catch {
    return null;
  }
}

const lowlight = createLowlight(common);

/* ---- Extension font-size (pas dans la version gratuite de Tiptap) ---- */
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_SIZES = [
  { label: "Petit",    value: "0.75rem" },
  { label: "Normal",   value: null },
  { label: "Grand",    value: "1.25rem" },
  { label: "Très grand", value: "1.5rem" },
  { label: "Titre",    value: "2rem" },
];

const LANGUAGES = [
  { label: "Texte brut", value: "" },
  { label: "Bash / Shell", value: "bash" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "CSS", value: "css" },
  { label: "Go", value: "go" },
  { label: "HTML", value: "html" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "PHP", value: "php" },
  { label: "Python", value: "python" },
  { label: "Rust", value: "rust" },
  { label: "SQL", value: "sql" },
  { label: "TypeScript", value: "typescript" },
  { label: "XML / HTML", value: "xml" },
  { label: "YAML", value: "yaml" },
];

const PRESET_COLORS = [
  { label: "Rouge",    value: "#ef4444" },
  { label: "Orange",  value: "#f97316" },
  { label: "Jaune",   value: "#eab308" },
  { label: "Vert",    value: "#22c55e" },
  { label: "Bleu",    value: "#3b82f6" },
  { label: "Violet",  value: "#a855f7" },
  { label: "Rose",    value: "#ec4899" },
  { label: "Gris",    value: "#6b7280" },
];

/* ---- Toolbar icons (inline SVG) ---- */
function Icon({ children, title, active, onClick, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      disabled={disabled}
      aria-pressed={active}
      className={`p-1.5 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-1
        ${active
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-200 dark:hover:bg-border text-inherit"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : ""}
      `}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-current opacity-20 mx-1" aria-hidden="true" />;
}

function FontSizePicker({ editor, theme }) {
  const current = editor.getAttributes("textStyle").fontSize ?? null;

  const border = theme === "dark" ? "border-border-2 bg-surface-deep text-white" : "border-gray-300 bg-white text-gray-900";

  return (
    <select
      value={current ?? ""}
      onChange={(e) => {
        const val = e.target.value || null;
        if (val) editor.chain().focus().setFontSize(val).run();
        else editor.chain().focus().unsetFontSize().run();
      }}
      title="Taille de police"
      aria-label="Taille de police"
      onMouseDown={(e) => e.preventDefault()}
      className={`h-7 text-xs rounded border px-1 outline-none cursor-pointer transition
        focus:ring-2 focus:ring-blue-500 ${border}`}
    >
      {FONT_SIZES.map(({ label, value }) => (
        <option key={label} value={value ?? ""}>{label}</option>
      ))}
    </select>
  );
}

function ColorPicker({ editor, theme }) {
  const [open, setOpen] = useState(false);
  const currentColor = editor.getAttributes("textStyle").color ?? null;

  const apply = (color) => {
    editor.chain().focus().setColor(color).run();
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().unsetColor().run();
    setOpen(false);
  };

  const border = theme === "dark" ? "border-border-2" : "border-gray-200";
  const bg = theme === "dark" ? "bg-surface" : "bg-white";

  return (
    <div className="relative">
      <button
        type="button"
        title="Couleur du texte"
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-1
          hover:bg-gray-200 dark:hover:bg-border`}
        aria-label="Couleur du texte"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 7H6l-3 9h2l1-3h4l1 3h2L9 7z" />
          <path d="M7.5 11.5l1-3 1 3h-2z" fill="currentColor" stroke="none" />
          <line x1="4" y1="20" x2="20" y2="20" strokeWidth="3"
            stroke={currentColor ?? "currentColor"} />
        </svg>
      </button>

      {open && (
        <div className={`absolute z-20 top-full left-0 mt-1 p-2 rounded-lg border shadow-lg ${border} ${bg}`}>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {PRESET_COLORS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => apply(value)}
                className={`w-6 h-6 rounded-full border-2 transition hover:scale-110
                  ${currentColor === value ? "border-white ring-2 ring-blue-500" : "border-transparent"}`}
                style={{ backgroundColor: value }}
                aria-label={label}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={remove}
            className={`w-full text-xs py-0.5 rounded border text-center transition
              ${theme === "dark" ? "border-border-2 hover:bg-border" : "border-gray-200 hover:bg-gray-100"}`}
          >
            Supprimer la couleur
          </button>
        </div>
      )}
    </div>
  );
}

function CodeLanguagePicker({ editor, theme }) {
  const [isFormatting, setIsFormatting] = useState(false);

  if (!editor.isActive("codeBlock")) return null;

  const currentLang = editor.getAttributes("codeBlock").language || "";
  const border = theme === "dark"
    ? "border-border-2 bg-surface-deep text-white"
    : "border-gray-300 bg-white text-gray-900";

  const handleChange = async (e) => {
    const newLang = e.target.value;

    // Locate the current code block before modifying editor state
    const { state } = editor;
    const { $from } = state.selection;
    let codeText = "";
    let nodePos = -1;

    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (node.type.name === "codeBlock") {
        if (pos <= $from.pos && $from.pos <= pos + node.nodeSize) {
          codeText = node.textContent;
          nodePos = pos;
          return false;
        }
      }
    });

    // 1. Update the language immediately (synchronous)
    editor.chain().focus().updateAttributes("codeBlock", { language: newLang }).run();

    // 2. Format if the language is supported and the block is not empty
    if (!codeText.trim() || nodePos === -1 || !PRETTIER_PARSERS[newLang]) return;

    setIsFormatting(true);
    try {
      const formatted = await formatWithPrettier(codeText, newLang);
      if (!formatted) return;

      // Retirer le saut de ligne final que prettier ajoute toujours
      const content = formatted.endsWith("\n") ? formatted.slice(0, -1) : formatted;
      if (content.trim() === codeText.trim()) return;

      // Replace the text content of the code block in the current state
      const { state: newState } = editor;
      const currentNode = newState.doc.nodeAt(nodePos);
      if (!currentNode || currentNode.type.name !== "codeBlock") return;

      const startPos = nodePos + 1;
      const endPos = nodePos + currentNode.nodeSize - 1;
      editor.view.dispatch(newState.tr.insertText(content, startPos, endPos));
    } catch {
      // Erreur silencieuse — on garde le code tel quel
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      disabled={isFormatting}
      title={isFormatting ? "Formatage…" : "Langage du bloc de code"}
      aria-label="Langage du bloc de code"
      className={`h-7 text-xs rounded border px-1 outline-none cursor-pointer transition
        focus:ring-2 focus:ring-blue-500 ${border} ${isFormatting ? "opacity-60 cursor-wait" : ""}`}
    >
      {LANGUAGES.map(({ label, value }) => (
        <option key={value || "plain"} value={value}>{label}</option>
      ))}
    </select>
  );
}

function Toolbar({ editor, theme, uploadEndpoint }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) return null;

  const handleLink = () => {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL du lien :", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    }
  };

  const handleImageUrl = () => {
    const url = window.prompt("URL de l'image :");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected
    e.target.value = "";

    setIsUploading(true);
    try {
      const csrfToken = await ensureCsrf();
      const formData = new FormData();
      formData.append("image", file);

      const resp = await fetch(uploadEndpoint, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken },
        body: formData,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.detail || `Erreur ${resp.status}`);
      }

      const { url } = await resp.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error("[ImageUpload]", err);
      alert(`Échec de l'upload : ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-0.5 p-2 border-b text-sm
        ${theme === "dark" ? "border-border text-white" : "border-gray-200 text-gray-800"}`}
      role="toolbar"
      aria-label="Outils de formatage"
    >
      {/* Gras */}
      <Icon
        title="Gras (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      </Icon>

      {/* Italique */}
      <Icon
        title="Italique (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <line x1="19" y1="4" x2="10" y2="4" />
        <line x1="14" y1="20" x2="5" y2="20" />
        <line x1="15" y1="4" x2="9" y2="20" />
      </Icon>

      {/* Strikethrough */}
      <Icon
        title="Barré"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 6 3.9h.4" />
        <path d="M21 12H3" />
        <path d="M7 17c0 2.7 2.3 4.1 5.3 4.1 2.3 0 4.5-.5 6.7-1.3" />
      </Icon>

      <Divider />

      {/* Titres */}
      <Icon
        title="Titre 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <path d="M4 12h8" />
        <path d="M4 18V6" />
        <path d="M12 18V6" />
        <path d="m17 12 3-2v8" />
      </Icon>

      <Icon
        title="Titre 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <path d="M4 12h8" />
        <path d="M4 18V6" />
        <path d="M12 18V6" />
        <path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" />
        <path d="M19 15c1.7 0 3 .6 3 1.5 0 1-1.3 1.5-3 1.5" />
      </Icon>

      <Divider />

      {/* Alignement */}
      <Icon
        title="Aligner à gauche"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="15" y2="12" />
        <line x1="3" y1="18" x2="18" y2="18" />
      </Icon>

      <Icon
        title="Centrer"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </Icon>

      <Icon
        title="Aligner à droite"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="6" y1="18" x2="21" y2="18" />
      </Icon>

      <Divider />

      {/* Listes */}
      <Icon
        title="Liste à puces"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
      </Icon>

      <Icon
        title="Liste numérotée"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <line x1="10" y1="6" x2="21" y2="6" />
        <line x1="10" y1="12" x2="21" y2="12" />
        <line x1="10" y1="18" x2="21" y2="18" />
        <path d="M4 6h1v4" />
        <path d="M4 10h2" />
        <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
      </Icon>

      {/* Citation */}
      <Icon
        title="Citation"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </Icon>

      {/* Code inline */}
      <Icon
        title="Code inline (Ctrl+E)"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </Icon>

      {/* Bloc de code */}
      <Icon
        title="Bloc de code"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m10 10-2 2 2 2" />
        <path d="m14 14 2-2-2-2" />
      </Icon>

      {/* Language picker — only visible inside a code block */}
      <CodeLanguagePicker editor={editor} theme={theme} />

      <Divider />

      {/* Taille de police */}
      <FontSizePicker editor={editor} theme={theme} />

      {/* Couleur du texte */}
      <ColorPicker editor={editor} theme={theme} />

      <Divider />

      {/* Lien */}
      <Icon
        title="Lien"
        active={editor.isActive("link")}
        onClick={handleLink}
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </Icon>

      {/* Image par URL */}
      <Icon title="Image par URL" onClick={handleImageUrl}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </Icon>

      {/* Upload image from disk — only shown when uploadEndpoint is provided */}
      {uploadEndpoint && (
        <>
          <Icon
            title={isUploading ? "Upload en cours…" : "Insérer une image depuis l'ordinateur"}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </Icon>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
            aria-hidden="true"
          />
        </>
      )}

      <Divider />

      {/* Undo / Redo */}
      <Icon
        title="Annuler (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.45" />
      </Icon>

      <Icon
        title="Rétablir (Ctrl+Shift+Z)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-.49-3.45" />
      </Icon>
    </div>
  );
}

/**
 * Éditeur rich text Tiptap.
 *
 * @param {object}   props
 * @param {string}   props.value            - Contenu HTML initial.
 * @param {Function} props.onChange         - Appelé avec le HTML à chaque changement.
 * @param {string}   [props.theme]          - "dark" | "light".
 * @param {string}   [props.className]
 * @param {string}   [props.uploadEndpoint] - URL de l'endpoint d'upload image.
 *                                            Si absent, seule l'insertion par URL est disponible.
 */
export default function RichTextEditor({ value, onChange, theme = "light", className = "", uploadEndpoint = null }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: null, enableTabIndentation: true }),
    ],
    content: value ?? "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync editor content when `value` changes from outside
  // (e.g. opening the modal with an existing article)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value ?? "", false);
    }
  }, [value, editor]);

  const border = theme === "dark" ? "border-border" : "border-gray-200";
  const bg = theme === "dark" ? "bg-surface text-white" : "bg-white text-gray-900";
  return (
    <div className={`rounded-lg border overflow-hidden ${border} ${bg} ${className}`}>
      <Toolbar editor={editor} theme={theme} uploadEndpoint={uploadEndpoint} />

      {/* Editing area */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] max-h-[500px] overflow-y-auto px-4 py-3"
      />
    </div>
  );
}
