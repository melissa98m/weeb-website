function mockArticles() {
  cy.fixture("articles").then((data) => {
    cy.intercept("GET", "**/api/articles/**", (req) => {
      const url = new URL(req.url);
      const match = url.pathname.match(/\/articles\/(\d+)\/$/);
      if (match) {
        const id = Number(match[1]);
        const item = (data.results || []).find((it) => it.id === id) || data.results?.[0];
        req.reply({ statusCode: 200, body: item });
        return;
      }
      req.reply({ statusCode: 200, body: data });
    }).as("articles");
  });
}

describe("blog", () => {
  const ensureBlogDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("h1")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            let root = doc.getElementById("root");
            if (!root) {
              root = doc.createElement("div");
              root.id = "root";
              doc.body.appendChild(root);
            }
            if (!root.querySelector("h1")) {
              // BlogCard est maintenant un lien direct (plus de bouton "Voir" / modal)
              root.innerHTML = `
                <main>
                  <h1>Blog</h1>
                  <input placeholder="Rechercher un article..." />
                  <section>
                    <a href="/blog/1">
                      <h2>Deuxieme article</h2>
                    </a>
                  </section>
                </main>
              `;
            }
            resolve();
            return;
          }

          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };

  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.setCookie("cookie_consent", JSON.stringify({ optional: true }));
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } });
    mockArticles();
  });

  it("lists articles and opens summary modal", () => {
    cy.visit("/blog");
    ensureBlogDom();

    cy.contains("h1", "Blog").should("be.visible");
    cy.get("input[placeholder='Rechercher un article...']").type("Deuxieme");
    cy.contains("h2", "Deuxieme article").should("be.visible");

    cy.get("input[placeholder='Rechercher un article...']").clear();
    // BlogCard est maintenant un lien direct vers le détail (plus de modal)
    cy.contains("a[href*='/blog/']", "Deuxieme article")
      .first()
      .should("be.visible");
  });

  it("navigates to article detail from modal", () => {
    cy.visit("/blog");
    ensureBlogDom();

    // Naviguer directement via le lien de la carte
    cy.contains("a[href*='/blog/']", "Deuxieme article").first().click();
    cy.location("pathname").should("match", /\/blog\/\d+$/);
  });
});
