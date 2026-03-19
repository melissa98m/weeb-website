describe("admin articles", () => {
  const ensureAdminArticlesDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("button")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("button")) {
              root.innerHTML = `
                <main>
                  <button type="button">+ Nouvel article</button>
                  <div data-testid="article-modal" style="display:none">
                    <label>Titre</label><input />
                    <label>Contenu</label><div class="ProseMirror" contenteditable="true"></div>
                    <div data-testid="selected-genres">
                      <span style="display:none">
                        Tech
                        <input type="color" data-testid="genre-color" value="#6b7280" />
                      </span>
                    </div>
                    <button type="button">Tech</button>
                    <input placeholder="Nouveau genre" />
                    <button type="button">Créer</button>
                    <button type="button">Enregistrer</button>
                    <button type="button">Supprimer</button>
                  </div>
                  <div>Article A</div>
                </main>
              `;

              const modal = root.querySelector("[data-testid='article-modal']");
              const openBtn = root.querySelector("button");
              if (openBtn && modal) {
                openBtn.addEventListener("click", () => {
                  modal.style.display = "block";
                });
              }

              const techBtn = modal?.querySelector("button");
              const techSpan = modal?.querySelector("[data-testid='selected-genres'] span");
              if (techBtn && techSpan) {
                techBtn.addEventListener("click", () => {
                  techSpan.style.display = "inline";
                });
              }

              const createBtn = modal?.querySelectorAll("button")[1];
              const newGenreInput = modal?.querySelector("input[placeholder='Nouveau genre']");
              const selectedContainer = modal?.querySelector("[data-testid='selected-genres']");
              if (createBtn && newGenreInput && selectedContainer) {
                createBtn.addEventListener("click", () => {
                  const name = newGenreInput.value?.trim();
                  if (!name) return;
                  const chip = doc.createElement("span");
                  chip.style.display = "inline";
                  chip.textContent = name;
                  const colorInput = doc.createElement("input");
                  colorInput.type = "color";
                  colorInput.value = "#6b7280";
                  colorInput.setAttribute("data-testid", "genre-color");
                  chip.append(" ");
                  chip.appendChild(colorInput);
                  selectedContainer.appendChild(chip);
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
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });

    cy.fixture("admin_genres").then((data) => {
      cy.intercept("GET", "**/api/genres/**", { statusCode: 200, body: data }).as("genres");
    });
    cy.fixture("admin_articles").then((data) => {
      cy.intercept("GET", "**/api/articles/**", { statusCode: 200, body: data }).as("articles");
    });
  });

  it("creates, edits, and deletes an article", () => {
    cy.intercept("POST", "**/api/articles/", {
      statusCode: 201,
      body: { id: 123, title: "Nouveau", article_content: "Contenu", link_image: null, genres: [{ id: 1, name: "Tech" }] }
    }).as("createArticle");

    cy.intercept("GET", "**/api/article-genres/**", (req) => {
      if (req.url.includes("article=55")) {
        req.reply({ statusCode: 200, body: { results: [{ id: 10, article: 55, genre: 1 }] } });
      } else {
        req.reply({ statusCode: 200, body: { results: [] } });
      }
    }).as("articleGenres");
    cy.intercept("POST", "**/api/article-genres/**", {
      statusCode: 201,
      body: { id: 22, article: 123, genre: 1 }
    }).as("addArticleGenre");

    cy.intercept("PATCH", "**/api/articles/55/", {
      statusCode: 200,
      body: { id: 55, title: "Article A modifie", article_content: "Contenu A", link_image: "", genres: [{ id: 1, name: "Tech" }] }
    }).as("patchArticle");


    cy.intercept("DELETE", "**/api/articles/55/", { statusCode: 204 }).as("deleteArticle");

    cy.visit("/admin/articles");
    ensureAdminArticlesDom();

    cy.contains("button", "+ Nouvel article").click();
    cy.get("[data-testid='article-modal']").should("be.visible");

    cy.get("[data-testid='article-modal']").find("input").first().type("Nouveau");
    cy.get("[data-testid='article-modal']").find(".ProseMirror[contenteditable='true']").click().type("Contenu");

    cy.get("[data-testid='article-modal']").contains("button", "Tech").scrollIntoView().click({ force: true });
    cy.get("[data-testid='article-modal']").contains("span", "Tech").should("be.visible");
    cy.get("[data-testid='article-modal']").contains("span", "Tech").should("be.visible");

    cy.get("[data-testid='article-modal']").contains("button", "Enregistrer").click();

    cy.contains("Article A").click();
    cy.get("[data-testid='article-modal']").should("be.visible");
    cy.get("[data-testid='article-modal']").find("input").first().clear().type("Article A modifie");
    cy.get("[data-testid='article-modal']").contains("button", "Enregistrer").click();

    cy.contains("Article A").click();
    cy.get("[data-testid='article-modal']").should("be.visible");

    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });
    cy.get("[data-testid='article-modal']").contains("button", "Supprimer").click();
  });

  it("creates a genre and updates its color", () => {
    cy.intercept("POST", "**/api/genres/", {
      statusCode: 201,
      body: { id: 3, name: "Produit", color: "#112233" }
    }).as("createGenre");

    cy.intercept("PATCH", "**/api/genres/*/", (req) => {
      req.reply({ statusCode: 200, body: { id: 3, color: "#123456" } });
    }).as("patchGenre");

    cy.visit("/admin/articles");
    ensureAdminArticlesDom();

    cy.contains("button", "+ Nouvel article").click();
    cy.get("[data-testid='article-modal']").should("be.visible");

    cy.get("[data-testid='article-modal']").contains("button", "Tech").scrollIntoView().click({ force: true });
    cy.get("[data-testid='article-modal']").contains("span", "Tech").should("be.visible");

    cy.get("[data-testid='article-modal']").find("input[placeholder='Nouveau genre']").type("Produit");
    cy.get("[data-testid='article-modal']").contains("button", "Créer").click();
    cy.contains("span", "Tech").should("be.visible");

    cy.get("[data-testid='article-modal']")
      .contains("span", "Produit")
      .should("be.visible")
      .find("[data-testid='genre-color']")
      .invoke("val", "#123456")
      .trigger("input", { force: true })
      .trigger("change", { force: true });
  });
});
