describe("admin", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: { count: 2 } });
    cy.intercept("GET", "**/api/messages/**", { statusCode: 200, body: { count: 3 } });
    cy.intercept("GET", "**/api/formations/**", {
      statusCode: 200,
      body: { count: 1, results: [{ id: 1, title: "Formation React", description: "React avance" }] }
    }).as("adminFormations");
  });

  it("shows admin home shortcuts", () => {
    cy.visit("/admin");
    cy.contains("h1", "Espace").should("be.visible");
    cy.contains("a", "Formations").should("be.visible");
    cy.contains("a", "Articles").should("be.visible");
    cy.contains("a", "Feedbacks").should("be.visible");
    cy.contains("a", "Messages").should("be.visible");
  });

  it("loads formations manager", () => {
    cy.visit("/admin/formations");
    cy.contains("h1", /formations/i).should("be.visible");
    cy.get("input[placeholder='Rechercher une formation']").should("be.visible");
  });
});
