describe("admin articles", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
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
    cy.wait(["@genres", "@articles"]);

    cy.contains("button", "+ Nouvel article").click();
    cy.get("[data-testid='article-modal']").should("be.visible");
    cy.wait("@genres");

    cy.get("[data-testid='article-modal']").contains("label", "Titre").parent().find("input").type("Nouveau");
    cy.get("[data-testid='article-modal']").contains("label", "Contenu").parent().find("textarea").type("Contenu");

    cy.get("[data-testid='article-modal']").contains("button", "Tech").scrollIntoView().click({ force: true });
    cy.get("[data-testid='article-modal']").contains("span", "Tech").should("be.visible");
    cy.get("[data-testid='article-modal']").contains("span", "Tech").should("be.visible");

    cy.get("[data-testid='article-modal']").contains("button", "Enregistrer").click();
    cy.wait(["@createArticle", "@articleGenres", "@addArticleGenre"]);

    cy.contains("Article A").click();
    cy.get("[data-testid='article-modal']").should("be.visible");
    cy.get("[data-testid='article-modal']").contains("label", "Titre").parent().find("input").clear().type("Article A modifie");
    cy.get("[data-testid='article-modal']").contains("button", "Enregistrer").click();
    cy.wait(["@patchArticle", "@articleGenres"]);

    cy.contains("Article A").click();
    cy.get("[data-testid='article-modal']").should("be.visible");

    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });
    cy.get("[data-testid='article-modal']").contains("button", "Supprimer").click();
    cy.wait("@deleteArticle");
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
    cy.wait(["@genres", "@articles"]);

    cy.contains("button", "+ Nouvel article").click();
    cy.get("[data-testid='article-modal']").should("be.visible");
    cy.wait("@genres");

    cy.get("[data-testid='article-modal']").contains("button", "Tech").scrollIntoView().click({ force: true });
    cy.get("[data-testid='article-modal']").contains("span", "Tech").should("be.visible");

    cy.get("[data-testid='article-modal']").find("input[placeholder='Nouveau genre']").type("Produit");
    cy.get("[data-testid='article-modal']").contains("button", "Créer").click();
    cy.wait("@createGenre");

    cy.get("[data-testid='article-modal']")
      .contains("span", "Produit")
      .should("be.visible")
      .find("[data-testid='genre-color']")
      .invoke("val", "#123456")
      .trigger("input", { force: true })
      .trigger("change", { force: true });
    cy.wait("@patchGenre").its("request.url").should("include", "/genres/3/");
  });
});
