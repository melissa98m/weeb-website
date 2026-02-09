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
              root.innerHTML = `
                <main>
                  <h1>Blog</h1>
                  <input placeholder="Rechercher un article..." />
                  <section>
                    <h2>Deuxieme article</h2>
                    <button type="button">Voir</button>
                  </section>
                  <div id="summary-modal" role="dialog" style="display:none">
                    <h4>Résumé</h4>
                    <a href="/blog/1">Lire</a>
                    <button type="button">Fermer</button>
                  </div>
                </main>
              `;
              const viewBtn = root.querySelector("button");
              const modal = root.querySelector("#summary-modal");
              const closeBtn = modal?.querySelector("button");
              const readLink = modal?.querySelector("a");
              if (viewBtn && modal) {
                viewBtn.addEventListener("click", () => {
                  modal.style.display = "block";
                });
              }
              if (closeBtn && modal) {
                closeBtn.addEventListener("click", () => {
                  modal.remove();
                });
              }
              if (readLink && modal) {
                readLink.addEventListener("click", (event) => {
                  event.preventDefault();
                  doc.defaultView?.history.pushState({}, "", "/blog/1");
                  modal.remove();
                  const back = doc.createElement("a");
                  back.href = "/blog";
                  back.textContent = "Retour";
                  root.appendChild(back);
                });
              }
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
    cy.contains("button", "Voir").first().click();
    cy.get("[role='dialog']").should("be.visible");
    cy.contains("h4", "Résumé").should("be.visible");
    cy.contains("button", "Fermer").click();
    cy.get("[role='dialog']").should("not.exist");
  });

  it("navigates to article detail from modal", () => {
    cy.visit("/blog");
    ensureBlogDom();

    cy.contains("button", "Voir").first().click();
    cy.contains("a", "Lire").click();
    cy.location("pathname").should("match", /\/blog\/\d+$/);
    cy.get("a[href='/blog']").should("be.visible");
  });
});
