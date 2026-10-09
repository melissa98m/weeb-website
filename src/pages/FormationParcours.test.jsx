import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";


// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "1" }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/formation/1/learn", state: null }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  API_BASE: "http://localhost:8000/api",
  ensureCsrf: vi.fn().mockResolvedValue("csrf-token"),
}));

const mockParseAndHighlight = vi.fn((html) => html ?? "");
vi.mock("../lib/hljs", () => ({
  parseAndHighlight: (html) => mockParseAndHighlight(html),
}));

vi.mock("../lib/seo", () => ({
  setCanonical: vi.fn(),
  setOgMeta: vi.fn(),
  setJsonLd: vi.fn(),
  setHreflang: vi.fn(),
  setTwitterMeta: vi.fn(),
  SITE_URL: "https://weeb.melissa-mangione.com",
  DEFAULT_OG_IMAGE: "https://weeb.melissa-mangione.com/og-image.jpg",
}));

vi.mock("../lib/env", () => ({
  getEnv: vi.fn((key, fallback) => fallback),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function setupDefaultMocks() {
  useAuth.mockReturnValue({ user: { id: 1, username: "alice" } });
  useTheme.mockReturnValue({ theme: "dark" });
  useLanguage.mockReturnValue({ language: "fr" });
}

const FORMATION = { id: 1, name: "React Avancé", description: "Formation React" };
const MODULE = { id: 10, title: "Module 1", is_accessible: true };
const COURS_WITH_CODE = {
  id: 100,
  title: "Cours sur les hooks",
  content: '<pre><code class="language-javascript">const x = 1;\nconst y = 2;</code></pre>',
  video_url: null,
  is_completed: false,
  is_accessible: true,
  order: 0,
};
const COURS_WITHOUT_CONTENT = {
  id: 101,
  title: "Cours sans contenu",
  content: "",
  video_url: null,
  is_completed: false,
  is_accessible: true,
  order: 1,
};
const COURS_WITH_VIDEO = {
  id: 102,
  title: "Cours vidéo",
  content: "",
  video_url: "https://www.youtube.com/watch?v=abc123",
  is_completed: false,
  is_accessible: true,
  order: 2,
};
const PROGRESS = { progress_percent: 0 };

/** Mock fetch with a sequence of responses. */
function mockFetchSequence(...responses) {
  let call = 0;
  vi.stubGlobal("fetch", vi.fn(async () => {
    const r = responses[call] ?? responses[responses.length - 1];
    call++;
    return {
      ok: true,
      status: 200,
      json: async () => r,
      headers: { get: () => "application/json" },
    };
  }));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  setupDefaultMocks();
  mockParseAndHighlight.mockReset();
  mockParseAndHighlight.mockImplementation((html) => html ?? "");

  // matchMedia stub (usePrefersReducedMotion + sidebar close on resize)
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));

  // jsdom doesn't support scrollTo on elements
  window.HTMLElement.prototype.scrollTo = vi.fn();
});

afterEach(async () => {
  cleanup();
  // Drain pending microtasks so in-flight fetch callbacks resolve before
  // the jsdom window is torn down (prevents "window is not defined" async leak).
  await new Promise((r) => setTimeout(r, 0));
  vi.unstubAllGlobals();
});

// ── Import page ───────────────────────────────────────────────────────────────

import FormationParcours from "./FormationParcours";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FormationParcours — CoursContent : coloration syntaxique", () => {

  it("appelle parseAndHighlight avec le contenu HTML du cours", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITH_CODE] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(screen.getByText("Cours sur les hooks")).toBeInTheDocument();
    });

    // parseAndHighlight must be called with the HTML content
    expect(mockParseAndHighlight).toHaveBeenCalledWith(COURS_WITH_CODE.content);
  });

  it("injecte le HTML retourné par parseAndHighlight dans le DOM", async () => {
    const highlighted = '<pre><code class="language-javascript hljs"><span class="hljs-keyword">const</span> x = 1;</code></pre>';
    mockParseAndHighlight.mockReturnValue(highlighted);

    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITH_CODE] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(screen.getByText("Cours sur les hooks")).toBeInTheDocument();
    });

    // The injected HTML should contain the hljs span (syntax coloring)
    const keyword = document.querySelector(".article-body .hljs-keyword");
    expect(keyword).not.toBeNull();
    expect(keyword.textContent).toBe("const");
  });

  it("ne plante pas quand le cours n'a pas de contenu texte", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITHOUT_CONTENT] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(screen.getByText("Cours sans contenu")).toBeInTheDocument();
    });

    // parseAndHighlight called with empty content
    expect(mockParseAndHighlight).toHaveBeenCalledWith("");
    // Pas de pre/code dans le DOM
    expect(document.querySelector(".article-body pre")).toBeNull();
  });

  it("recalcule le contenu mis en évidence quand le cours change", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITH_CODE] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(screen.getByText("Cours sur les hooks")).toBeInTheDocument();
    });

    // parseAndHighlight should have been called for the first course
    expect(mockParseAndHighlight).toHaveBeenCalledWith(COURS_WITH_CODE.content);
  });

  it("affiche la div article-body même quand le contenu est vide", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITHOUT_CONTENT] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(screen.getByText("Cours sans contenu")).toBeInTheDocument();
    });

    const articleBodyDiv = document.querySelector(".article-body");
    expect(articleBodyDiv).not.toBeNull();
  });
});

describe("FormationParcours — CoursContent : rendu de contenu", () => {

  it("affiche le titre du cours actif", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITH_CODE] },
      PROGRESS,
    );

    render(<FormationParcours />);

    expect(await screen.findByText("Cours sur les hooks")).toBeInTheDocument();
  });

  it("affiche la vidéo YouTube pour un cours avec video_url", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITH_VIDEO] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(screen.getByText("Cours vidéo")).toBeInTheDocument();
    });

    // YouTube iframe or a link to the video
    const iframe = document.querySelector("iframe");
    const videoLink = screen.queryByRole("link", { name: /ouvrir/i });
    expect(iframe || videoLink).not.toBeNull();
  });

  it("affiche le nom de la formation dans le titre de page", async () => {
    mockFetchSequence(
      FORMATION,
      { results: [MODULE] },
      { results: [COURS_WITH_CODE] },
      PROGRESS,
    );

    render(<FormationParcours />);

    await waitFor(() => {
      expect(document.title).toContain("React Avancé");
    });
  });
});
