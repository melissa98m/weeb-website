describe("formations", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } });
    cy.fixture("formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
  });

  it("filters formations and opens details modal", () => {
    cy.visit("/formations");

    cy.contains("h1", "Formations").should("be.visible");
    cy.get("input[placeholder='Rechercher une formation…']").type("React");
    cy.contains("h3", "Formation React").should("be.visible");

    cy.get("input[placeholder='Rechercher une formation…']").clear();
    cy.contains("button", "Voir les détails").first().click();
    cy.get("[role='dialog']").should("be.visible");
    cy.contains("a", "Aller au formulaire de contact").should("be.visible");
  });

  it("supports load more when results exceed initial slice", () => {
    cy.visit("/formations");

    cy.contains("button", "Charger plus").click();
    cy.contains("h3", "Formation Performance").should("be.visible");
  });
});
