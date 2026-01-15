describe("profile", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.fixture("profile_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
    cy.fixture("profile_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data }).as("feedbacks");
    });
    cy.intercept("POST", "**/api/feedbacks/", {
      statusCode: 200,
      body: { id: 999, formation: 202, feedback_content: "Super" }
    }).as("sendFeedback");
  });

  it("shows formations and allows sending feedback", () => {
    cy.visit("/profile");

    cy.contains("h1", "Mon profil").should("be.visible");
    cy.contains("h2", "Mes formations").should("be.visible");

    cy.contains("div", "Formation React").should("be.visible");
    cy.contains("span", "Feedback").should("be.visible");

    cy.contains("button", "Donner un feedback").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("textarea").type("Formation claire et utile.");
    cy.contains("button", "Envoyer").click();

    cy.contains("span", "Feedback").should("be.visible");
  });
});
