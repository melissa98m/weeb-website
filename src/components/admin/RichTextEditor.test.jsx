/**
 * Tests — RichTextEditor
 *
 * Couvre :
 * - Rendu de base et accessibilité
 * - Boutons de formatage (toolbar)
 * - Bloc de code (toggleCodeBlock, inline code, sélecteur de langage)
 * - Alignement du texte
 * - Sélecteur de couleur (ColorPicker)
 * - Sélecteur de taille de police (FontSizePicker)
 * - Upload d'image (succès, erreur, réseau)
 * - Insertion d'image par URL
 * - Synchronisation du contenu (prop value)
 * - Thème dark / light
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks CSS (jsdom ignore les imports CSS) ───────────────────────────────────

vi.mock("highlight.js/styles/github-dark-dimmed.css", () => ({}));

// ── Mocks Tiptap (ProseMirror ne fonctionne pas en jsdom) ─────────────────────

vi.mock("@tiptap/starter-kit", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-image", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-link", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/core", () => ({
  Extension: { create: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-color", () => ({ Color: {} }));
vi.mock("@tiptap/extension-text-style", () => ({ TextStyle: {} }));
vi.mock("@tiptap/extension-text-align", () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock("@tiptap/extension-code-block-lowlight", () => ({
  CodeBlockLowlight: { configure: vi.fn(() => ({})) },
}));
vi.mock("lowlight", () => ({
  createLowlight: vi.fn(() => ({
    highlight: vi.fn(),
    highlightAuto: vi.fn(),
    listLanguages: vi.fn(() => []),
  })),
  common: {},
}));
vi.mock("../../lib/api", () => ({
  ensureCsrf: vi.fn(() => Promise.resolve("csrf-test-token")),
}));

// ── Mock editor ────────────────────────────────────────────────────────────────

function makeChain() {
  const chain = {};
  const methods = [
    "focus", "toggleBold", "toggleItalic", "toggleStrike",
    "toggleHeading", "toggleBulletList", "toggleOrderedList",
    "toggleBlockquote", "toggleCode", "toggleCodeBlock",
    "setLink", "unsetLink", "setImage",
    "setTextAlign", "setColor", "unsetColor", "setMark",
    "removeEmptyTextStyle", "setFontSize", "unsetFontSize",
    "updateAttributes", "undo", "redo",
  ];
  methods.forEach((m) => { chain[m] = vi.fn(() => chain); });
  chain.run = vi.fn(() => true);
  return chain;
}

let mockChain;
let mockEditor;

function buildMockEditor(overrides = {}) {
  mockChain = makeChain();
  return {
    isActive: vi.fn(() => false),
    chain: vi.fn(() => mockChain),
    getAttributes: vi.fn(() => ({})),
    getHTML: vi.fn(() => "<p></p>"),
    commands: { setContent: vi.fn() },
    can: vi.fn(() => ({
      undo: vi.fn(() => true),
      redo: vi.fn(() => true),
    })),
    state: {
      selection: { $from: { pos: 0 } },
      doc: {
        content: { size: 0 },
        nodesBetween: vi.fn(),
        nodeAt: vi.fn(() => null),
      },
      tr: { insertText: vi.fn(() => ({ insertText: vi.fn() })) },
    },
    view: { dispatch: vi.fn() },
    ...overrides,
  };
}

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: () => (
    <div data-testid="editor-content" aria-label="Zone de rédaction" />
  ),
}));

import RichTextEditor from "./RichTextEditor";
import { useEditor } from "@tiptap/react";

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockEditor = buildMockEditor();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Rendu de base ──────────────────────────────────────────────────────────────

describe("RichTextEditor — rendu de base", () => {
  it("affiche la zone d'édition", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("affiche la toolbar avec son rôle ARIA", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("la toolbar a un label accessible", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(
      screen.getByRole("toolbar", { name: /outils de formatage/i })
    ).toBeInTheDocument();
  });

  it("ne crash pas sans value ni onChange", () => {
    expect(() =>
      render(<RichTextEditor value="" onChange={() => {}} />)
    ).not.toThrow();
  });

  it("ne rend rien si l'éditeur n'est pas initialisé", () => {
    useEditor.mockReturnValueOnce(null);
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});

// ── Boutons de formatage ───────────────────────────────────────────────────────

describe("RichTextEditor — boutons de formatage", () => {
  it("le bouton Gras appelle toggleBold", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/gras/i));
    expect(mockChain.toggleBold).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("le bouton Italique appelle toggleItalic", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/italique/i));
    expect(mockChain.toggleItalic).toHaveBeenCalled();
  });

  it("le bouton Barré appelle toggleStrike", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/barré/i));
    expect(mockChain.toggleStrike).toHaveBeenCalled();
  });

  it("le bouton Titre 2 appelle toggleHeading avec level:2", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle("Titre 2"));
    expect(mockChain.toggleHeading).toHaveBeenCalledWith({ level: 2 });
  });

  it("le bouton Titre 3 appelle toggleHeading avec level:3", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle("Titre 3"));
    expect(mockChain.toggleHeading).toHaveBeenCalledWith({ level: 3 });
  });

  it("le bouton Liste à puces appelle toggleBulletList", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/liste à puces/i));
    expect(mockChain.toggleBulletList).toHaveBeenCalled();
  });

  it("le bouton Liste numérotée appelle toggleOrderedList", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/liste numérotée/i));
    expect(mockChain.toggleOrderedList).toHaveBeenCalled();
  });

  it("le bouton Citation appelle toggleBlockquote", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/citation/i));
    expect(mockChain.toggleBlockquote).toHaveBeenCalled();
  });

  it("le bouton Annuler est désactivé quand can().undo() est false", () => {
    mockEditor.can = vi.fn(() => ({ undo: vi.fn(() => false), redo: vi.fn(() => true) }));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/annuler/i)).toBeDisabled();
  });

  it("le bouton Rétablir est désactivé quand can().redo() est false", () => {
    mockEditor.can = vi.fn(() => ({ undo: vi.fn(() => true), redo: vi.fn(() => false) }));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/rétablir/i)).toBeDisabled();
  });
});

// ── Bloc de code ───────────────────────────────────────────────────────────────

describe("RichTextEditor — bloc de code", () => {
  it("le bouton 'Bloc de code' est présent dans la toolbar", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/bloc de code/i)).toBeInTheDocument();
  });

  it("le bouton 'Code inline' est présent dans la toolbar", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/code inline/i)).toBeInTheDocument();
  });

  it("cliquer sur 'Bloc de code' appelle toggleCodeBlock via la chaîne", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/bloc de code/i));
    expect(mockChain.toggleCodeBlock).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("cliquer sur 'Code inline' appelle toggleCode via la chaîne", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/code inline/i));
    expect(mockChain.toggleCode).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("le bouton 'Bloc de code' a aria-pressed=true quand isActive retourne true", () => {
    mockEditor.isActive = vi.fn((name) => name === "codeBlock");
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const btn = screen.getByTitle("Bloc de code");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("le sélecteur de langage n'est PAS affiché hors d'un bloc de code", () => {
    mockEditor.isActive = vi.fn(() => false);
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.queryByTitle(/langage du bloc de code/i)).not.toBeInTheDocument();
  });

  it("le sélecteur de langage APPARAÎT quand le curseur est dans un bloc de code", () => {
    mockEditor.isActive = vi.fn((name) => name === "codeBlock");
    mockEditor.getAttributes = vi.fn(() => ({ language: "javascript" }));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/langage du bloc de code/i)).toBeInTheDocument();
  });

  it("le sélecteur de langage affiche le langage actif (python)", () => {
    mockEditor.isActive = vi.fn((name) => name === "codeBlock");
    mockEditor.getAttributes = vi.fn(() => ({ language: "python" }));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const select = screen.getByTitle(/langage du bloc de code/i);
    expect(select.value).toBe("python");
  });

  it("le sélecteur de langage contient les langages courants", () => {
    mockEditor.isActive = vi.fn((name) => name === "codeBlock");
    mockEditor.getAttributes = vi.fn(() => ({}));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const select = screen.getByTitle(/langage du bloc de code/i);
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("javascript");
    expect(options).toContain("python");
    expect(options).toContain("bash");
    expect(options).toContain("sql");
    expect(options).toContain("typescript");
  });

  it("changer le langage appelle updateAttributes avec le bon langage", async () => {
    const user = userEvent.setup();
    mockEditor.isActive = vi.fn((name) => name === "codeBlock");
    mockEditor.getAttributes = vi.fn(() => ({ language: "" }));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const select = screen.getByTitle(/langage du bloc de code/i);
    await user.selectOptions(select, "python");
    expect(mockChain.updateAttributes).toHaveBeenCalledWith("codeBlock", { language: "python" });
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("changer vers 'Texte brut' appelle updateAttributes avec language vide", async () => {
    const user = userEvent.setup();
    mockEditor.isActive = vi.fn((name) => name === "codeBlock");
    mockEditor.getAttributes = vi.fn(() => ({ language: "javascript" }));
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const select = screen.getByTitle(/langage du bloc de code/i);
    await user.selectOptions(select, "");
    expect(mockChain.updateAttributes).toHaveBeenCalledWith("codeBlock", { language: "" });
  });
});

// ── Comportement onMouseDown (focus préservé) ──────────────────────────────────

describe("RichTextEditor — préservation du focus éditeur", () => {
  it("mousedown sur le bouton Gras ne déclenche pas de blur sur l'éditeur (preventDefault)", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const btn = screen.getByTitle(/gras/i);
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    btn.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("mousedown sur le bouton Bloc de code appelle preventDefault", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const btn = screen.getByTitle(/bloc de code/i);
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    btn.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("mousedown sur le bouton Bloc de code appelle toggleCodeBlock", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const btn = screen.getByTitle(/bloc de code/i);
    fireEvent.mouseDown(btn);
    expect(mockChain.toggleCodeBlock).toHaveBeenCalled();
  });

  it("mousedown sur le bouton Code inline appelle toggleCode", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const btn = screen.getByTitle(/code inline/i);
    fireEvent.mouseDown(btn);
    expect(mockChain.toggleCode).toHaveBeenCalled();
  });
});

// ── Alignement ─────────────────────────────────────────────────────────────────

describe("RichTextEditor — alignement", () => {
  it("le bouton gauche appelle setTextAlign('left')", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/aligner à gauche/i));
    expect(mockChain.setTextAlign).toHaveBeenCalledWith("left");
  });

  it("le bouton centrer appelle setTextAlign('center')", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/centrer/i));
    expect(mockChain.setTextAlign).toHaveBeenCalledWith("center");
  });

  it("le bouton droite appelle setTextAlign('right')", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/aligner à droite/i));
    expect(mockChain.setTextAlign).toHaveBeenCalledWith("right");
  });
});

// ── ColorPicker ────────────────────────────────────────────────────────────────

describe("RichTextEditor — ColorPicker", () => {
  it("le bouton couleur est présent dans la toolbar", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/couleur du texte/i)).toBeInTheDocument();
  });

  it("la palette s'ouvre au clic sur le bouton couleur", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/couleur du texte/i));
    expect(screen.getByTitle("Rouge")).toBeInTheDocument();
    expect(screen.getByTitle("Bleu")).toBeInTheDocument();
  });

  it("la palette se ferme après sélection d'une couleur", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/couleur du texte/i));
    await user.click(screen.getByTitle("Rouge"));
    expect(screen.queryByTitle("Vert")).not.toBeInTheDocument();
  });

  it("sélectionner Rouge appelle setColor('#ef4444')", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/couleur du texte/i));
    await user.click(screen.getByTitle("Rouge"));
    expect(mockChain.setColor).toHaveBeenCalledWith("#ef4444");
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("le bouton 'Supprimer la couleur' appelle unsetColor", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/couleur du texte/i));
    await user.click(screen.getByText(/supprimer la couleur/i));
    expect(mockChain.unsetColor).toHaveBeenCalled();
  });

  it("affiche 8 couleurs dans la palette", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/couleur du texte/i));
    const colorButtons = screen
      .getAllByRole("button")
      .filter((b) => b.style.backgroundColor);
    expect(colorButtons.length).toBeGreaterThanOrEqual(8);
  });
});

// ── FontSizePicker ─────────────────────────────────────────────────────────────

describe("RichTextEditor — FontSizePicker", () => {
  it("affiche le sélecteur de taille", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/taille de police/i)).toBeInTheDocument();
  });

  it("contient les options Petit, Normal, Grand, Très grand, Titre", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const select = screen.getByTitle(/taille de police/i);
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toContain("Petit");
    expect(options).toContain("Normal");
    expect(options).toContain("Grand");
    expect(options).toContain("Très grand");
    expect(options).toContain("Titre");
  });

  it("choisir Grand appelle setFontSize('1.25rem')", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.selectOptions(screen.getByTitle(/taille de police/i), "Grand");
    expect(mockChain.setFontSize).toHaveBeenCalledWith("1.25rem");
  });

  it("choisir Normal appelle unsetFontSize", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.selectOptions(screen.getByTitle(/taille de police/i), "Normal");
    expect(mockChain.unsetFontSize).toHaveBeenCalled();
  });
});

// ── Upload image ───────────────────────────────────────────────────────────────

describe("RichTextEditor — upload image", () => {
  const uploadEndpoint = "http://localhost:8000/api/upload/image/";

  it("affiche le bouton upload quand uploadEndpoint est fourni", () => {
    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );
    expect(
      screen.getByTitle(/insérer une image depuis l'ordinateur/i)
    ).toBeInTheDocument();
  });

  it("n'affiche pas le bouton upload sans uploadEndpoint", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(
      screen.queryByTitle(/insérer une image depuis l'ordinateur/i)
    ).not.toBeInTheDocument();
  });

  it("l'input file est caché dans le DOM", () => {
    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("hidden");
  });

  it("l'input file accepte uniquement les images", () => {
    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );
    const input = document.querySelector('input[type="file"]');
    expect(input.accept).toContain("image/jpeg");
    expect(input.accept).toContain("image/png");
  });

  it("upload réussi : fetch appelé avec FormData et CSRF", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ url: "http://localhost/media/cours/images/abc.png" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );

    const input = document.querySelector('input[type="file"]');
    const file = new File([new Uint8Array(100)], "photo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        uploadEndpoint,
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: expect.objectContaining({ "X-CSRFToken": "csrf-test-token" }),
        })
      );
    });
    vi.unstubAllGlobals();
  });

  it("upload réussi : setImage appelé avec l'URL retournée", async () => {
    const imageUrl = "http://localhost/media/cours/images/uuid.png";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ url: imageUrl }),
    }));

    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );

    const input = document.querySelector('input[type="file"]');
    const file = new File([new Uint8Array(10)], "img.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockChain.setImage).toHaveBeenCalledWith({ src: imageUrl });
    });
    vi.unstubAllGlobals();
  });

  it("upload échoué : alert affiché", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ detail: "Type non supporté" }),
    }));
    const alertMock = vi.fn();
    vi.stubGlobal("alert", alertMock);

    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: { files: [new File(["x"], "x.png", { type: "image/png" })] },
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });
    vi.unstubAllGlobals();
  });

  it("erreur réseau : alert affiché sans crash", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const alertMock = vi.fn();
    vi.stubGlobal("alert", alertMock);

    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );

    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["x"], "x.png", { type: "image/png" })] },
    });

    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    vi.unstubAllGlobals();
  });

  it("le bouton upload est désactivé pendant l'upload", async () => {
    let resolveFetch;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    ));

    render(
      <RichTextEditor value="" onChange={vi.fn()} uploadEndpoint={uploadEndpoint} />
    );

    const btn = screen.getByTitle(/insérer une image depuis l'ordinateur/i);
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["x"], "x.png", { type: "image/png" })] },
    });

    await waitFor(() => expect(btn).toBeDisabled());

    resolveFetch({ ok: true, json: async () => ({ url: "http://x.com/img.png" }) });
    vi.unstubAllGlobals();
  });
});

// ── Insertion image par URL ────────────────────────────────────────────────────

describe("RichTextEditor — image par URL", () => {
  it("le bouton 'Image par URL' est présent", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByTitle(/image par url/i)).toBeInTheDocument();
  });

  it("prompt annulé : setImage non appelé", async () => {
    vi.stubGlobal("prompt", vi.fn(() => null));
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/image par url/i));
    expect(mockChain.setImage).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("URL saisie : setImage appelé avec src", async () => {
    vi.stubGlobal("prompt", vi.fn(() => "https://example.com/img.png"));
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    await user.click(screen.getByTitle(/image par url/i));
    expect(mockChain.setImage).toHaveBeenCalledWith({
      src: "https://example.com/img.png",
    });
    vi.unstubAllGlobals();
  });
});

// ── Thème ──────────────────────────────────────────────────────────────────────

describe("RichTextEditor — thème", () => {
  it("thème dark : la toolbar a la classe border-border", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} theme="dark" />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.className).toContain("border-border");
  });

  it("thème light : la toolbar a la classe border-gray-200", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} theme="light" />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.className).toContain("border-gray-200");
  });
});

// ── Synchronisation contenu ────────────────────────────────────────────────────

describe("RichTextEditor — synchronisation value", () => {
  it("setContent appelé quand value change et diffère du HTML actuel", async () => {
    mockEditor.getHTML = vi.fn(() => "<p>ancien</p>");
    const { rerender } = render(
      <RichTextEditor value="<p>ancien</p>" onChange={vi.fn()} />
    );
    rerender(<RichTextEditor value="<p>nouveau</p>" onChange={vi.fn()} />);
    await waitFor(() => {
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
        "<p>nouveau</p>",
        false
      );
    });
  });

  it("setContent NON appelé quand value est identique au HTML de l'éditeur", async () => {
    mockEditor.getHTML = vi.fn(() => "<p>identique</p>");
    render(<RichTextEditor value="<p>identique</p>" onChange={vi.fn()} />);
    await waitFor(() => {
      expect(mockEditor.commands.setContent).not.toHaveBeenCalled();
    });
  });
});
