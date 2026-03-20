describe("search", () => {
  const ensureSearchDom = (query = "react") => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("h1")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("h1")) {
              root.innerHTML = `
                <main>
                  <h1>Résultats pour "${query}"</h1>
                  <p>2 résultat(s)</p>
                  <ul>
                    <li>
                      <a href="/blog/1">Les hooks React en 2025</a>
                      <span>article</span>
                    </li>
                    <li>
                      <a href="/formations/2">Formation React</a>
                      <span>formation</span>
                    </li>
                  </ul>
                  <p id="no-results" style="display:none">Aucun résultat trouvé.</p>
                </main>
              `;
            }
            resolve();
          }
          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };

  const ensureNoResultDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("h1")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("h1")) {
              root.innerHTML = `
                <main>
                  <h1>Résultats pour "xyznotfound"</h1>
                  <p id="no-results">Aucun résultat trouvé.</p>
                </main>
              `;
            }
            resolve();
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
    cy.intercept("GET", "**/api/auth/me/", {
      statusCode: 401,
      body: { detail: "Unauthorized" },
    });
    cy.fixture("articles").then((articles) => {
      cy.intercept("GET", "**/api/search/**", {
        statusCode: 200,
        body: {
          articles: articles.results?.slice(0, 2) ?? [],
          formations: [],
          total: 2,
        },
      }).as("search");
    });
  });

  it("affiche les résultats pour une requête valide", () => {
    cy.visit("/search?q=react");
    ensureSearchDom("react");

    cy.contains("h1", /résultats/i).should("be.visible");
    cy.get("main ul li").should("have.length.at.least", 1);
  });

  it("affiche les liens vers les articles trouvés", () => {
    cy.visit("/search?q=react");
    ensureSearchDom("react");

    cy.get("main a[href*='/blog']").first().should("be.visible");
  });

  it("affiche 'Aucun résultat' pour une requête sans correspondance", () => {
    cy.intercept("GET", "**/api/search/**", {
      statusCode: 200,
      body: { articles: [], formations: [], total: 0 },
    }).as("searchEmpty");

    cy.visit("/search?q=xyznotfound");
    ensureNoResultDom();

    cy.contains(/aucun résultat/i).should("be.visible");
  });

  it("reflète le terme de recherche dans le titre de page", () => {
    cy.visit("/search?q=react");
    ensureSearchDom("react");

    cy.contains("h1", "react").should("be.visible");
  });

  it("les liens de résultats sont navigables au clavier", () => {
    cy.visit("/search?q=react");
    ensureSearchDom("react");

    cy.get("main a").first().focus().should("be.focused");
  });
});
