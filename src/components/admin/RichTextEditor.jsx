import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

/* ---- Icônes toolbar (SVG inline) ---- */
function Icon({ children, title, active, onClick, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`p-1.5 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-1
        ${active
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-200 dark:hover:bg-[#333] text-inherit"
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

function Toolbar({ editor, theme }) {
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

  const handleImage = () => {
    const url = window.prompt("URL de l'image :");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-0.5 p-2 border-b text-sm
        ${theme === "dark" ? "border-[#333] text-white" : "border-gray-200 text-gray-800"}`}
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

      {/* Barré */}
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

      {/* Image */}
      <Icon title="Image" onClick={handleImage}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </Icon>

      <Divider />

      {/* Annuler / Rétablir */}
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
 * @param {string}   props.value      - Contenu HTML initial.
 * @param {Function} props.onChange   - Appelé avec le HTML à chaque changement.
 * @param {string}   [props.theme]    - "dark" | "light".
 * @param {string}   [props.className]
 */
export default function RichTextEditor({ value, onChange, theme = "light", className = "" }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value ?? "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Synchronise le contenu quand `value` change depuis l'extérieur
  // (ex : ouverture de la modale avec un article existant)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value ?? "", false);
    }
  }, [value, editor]);

  const border = theme === "dark" ? "border-[#333]" : "border-gray-200";
  const bg = theme === "dark" ? "bg-[#1c1c1c] text-white" : "bg-white text-gray-900";
  const proseClass = theme === "dark" ? "prose-invert" : "";

  return (
    <div className={`rounded-lg border overflow-hidden ${border} ${bg} ${className}`}>
      <Toolbar editor={editor} theme={theme} />

      {/* Zone d'édition */}
      <EditorContent
        editor={editor}
        className={`
          min-h-[200px] max-h-[500px] overflow-y-auto
          px-4 py-3 focus-within:outline-none
          prose ${proseClass} prose-sm max-w-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:opacity-40
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_blockquote]:border-l-4
          [&_.ProseMirror_blockquote]:pl-4
          [&_.ProseMirror_blockquote]:opacity-70
          [&_.ProseMirror_a]:text-blue-500
          [&_.ProseMirror_a]:underline
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:rounded
        `}
      />
    </div>
  );
}
