const MOCK_API_BASES = [
  "https://weebbackend.melissa-mangione.com/api",
  "http://localhost:8000/api",
];

function getUrl(input) {
  if (typeof input === "string") return input;
  if (input && typeof input.url === "string") return input.url;
  return "";
}

function isMockable(url) {
  return MOCK_API_BASES.some((base) => url.startsWith(base));
}

function jsonResponse(data, { status = 200 } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function installStorybookMocks() {
  if (typeof window === "undefined") return;
  if (window.__STORYBOOK_MOCKS_INSTALLED__) return;
  window.__STORYBOOK_MOCKS_INSTALLED__ = true;

  const originalFetch = window.fetch?.bind(window);
  if (!originalFetch) return;

  window.fetch = async (input, init = {}) => {
    const url = getUrl(input);
    const method = (init.method || "GET").toUpperCase();

    if (isMockable(url)) {
      const parsed = new URL(url);
      const pathname = parsed.pathname;

      if (pathname.endsWith("/auth/csrf/") || pathname.endsWith("/csrf/")) {
        return jsonResponse({ csrfToken: "storybook-token" });
      }

      if (pathname.endsWith("/auth/me/")) {
        return jsonResponse({
          id: 1,
          username: "storybook",
          email: "storybook@weeb.dev",
          roles: [],
          is_staff: false,
          is_superuser: false,
        });
      }

      if (pathname.endsWith("/auth/login/")) {
        return jsonResponse({ access: "demo-access", refresh: "demo-refresh" });
      }

      if (pathname.endsWith("/auth/logout/")) {
        return jsonResponse({ ok: true });
      }

      if (pathname.endsWith("/subjects/") && method === "GET") {
        return jsonResponse([
          { id: 1, name: "Support" },
          { id: 2, name: "Formation" },
          { id: 3, name: "Partenariat" },
        ]);
      }

      if (pathname.endsWith("/articles/") && method === "GET") {
        return jsonResponse({
          results: [
            {
              id: 101,
              title: "Tokyo Ink: Dessiner la nuit",
              created_at: "2024-11-12",
              genres: [
                { id: 1, name: "Art", color: "#F97316" },
                { id: 2, name: "Culture", color: "#38BDF8" },
              ],
              link_image: "/weeb.svg",
              author: "Yuki Tanaka",
            },
            {
              id: 102,
              title: "Retro Web: l'elegance du pixel",
              created_at: "2024-10-05",
              genres: [
                { id: 2, name: "Culture", color: "#38BDF8" },
                { id: 3, name: "Design", color: "#A78BFA" },
              ],
              link_image: "/weeb.svg",
              author: "Mina Sato",
            },
            {
              id: 103,
              title: "UI Trends 2025",
              created_at: "2024-09-20",
              genres: [
                { id: 3, name: "Design", color: "#A78BFA" },
              ],
              link_image: "/weeb.svg",
              author: "Liam",
            },
          ],
        });
      }

      if (pathname.endsWith("/messages/") && method === "POST") {
        return jsonResponse({ id: 1, status: "created" }, { status: 201 });
      }

      if (pathname.endsWith("/newsletter-consents/") && method === "POST") {
        return jsonResponse({ id: 1, status: "created" }, { status: 201 });
      }

      if (pathname.endsWith("/feedbacks/") && method === "POST") {
        return jsonResponse({ id: 1, status: "created" }, { status: 201 });
      }

      return jsonResponse({ detail: "storybook mock: not found" }, { status: 404 });
    }

    return originalFetch(input, init);
  };
}
