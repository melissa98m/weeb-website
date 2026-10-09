describe("profile", () => {
  const FEEDBACK_DIALOG = "[role='dialog'][aria-labelledby='feedback-modal-title']";

  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.fixture("profile_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
    cy.intercept("GET", "**/api/formations/*/progress/", {
      statusCode: 200,
      body: { progress_percent: 100, modules: [] },
    }).as("progress");
    // Formation 201 already has a feedback, formation 202 does not
    cy.fixture("profile_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data }).as("feedbacks");
    });
    cy.intercept("POST", "**/api/feedbacks/", {
      statusCode: 201,
      body: { id: 999, formation: 202, feedback_content: "Formation claire et utile." },
    }).as("sendFeedback");
  });

  it("shows formations and allows sending feedback", () => {
    cy.visit("/profile");
    cy.wait(["@me", "@formations", "@feedbacks"]);

    // The h1 shows the user's display name since the sidebar layout (8a203f1)
    cy.contains("h1", "melissa").should("be.visible");
    cy.contains("h2", "Mes formations").should("be.visible");
    cy.contains("Formation React").should("be.visible");
    cy.contains("Formation Node").should("be.visible");

    // Only the formation without feedback offers the button
    cy.get("span").filter(":contains('Feedback déjà envoyé')").should("have.length", 1);
    cy.get("button").filter(":contains('Donner un feedback')").should("have.length", 1).click();

    cy.get(FEEDBACK_DIALOG)
      .should("be.visible")
      .within(() => {
        cy.contains("Formation Node").should("be.visible");
        cy.get("textarea").type("Formation claire et utile.");
        cy.contains("button", "Envoyer").click();
      });

    cy.wait("@sendFeedback")
      .its("request.body")
      .should("deep.equal", { formation: 202, feedback_content: "Formation claire et utile." });
    cy.get(FEEDBACK_DIALOG).should("not.exist");
    cy.contains("button", "Donner un feedback").should("not.exist");
    cy.get("span").filter(":contains('Feedback déjà envoyé')").should("have.length", 2);
  });
});
