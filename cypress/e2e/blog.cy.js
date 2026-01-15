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
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } });
    mockArticles();
  });

  it("lists articles and opens summary modal", () => {
    cy.visit("/blog");

    cy.contains("h1", "Blog").should("be.visible");
    cy.get("input[placeholder='Rechercher un article...']").type("Deuxieme");
    cy.contains("h3", "Deuxieme article").should("be.visible");

    cy.get("input[placeholder='Rechercher un article...']").clear();
    cy.contains("button", "Voir").first().click();
    cy.get("[role='dialog']").should("be.visible");
    cy.contains("h4", "Résumé").should("be.visible");
    cy.contains("button", "Fermer").click();
    cy.get("[role='dialog']").should("not.exist");
  });

  it("navigates to article detail from modal", () => {
    cy.visit("/blog");

    cy.contains("button", "Voir").first().click();
    cy.contains("a", "Lire").click();
    cy.location("pathname").should("match", /\/blog\/\d+$/);
    cy.get("a[href='/blog']").should("be.visible");
  });
});
