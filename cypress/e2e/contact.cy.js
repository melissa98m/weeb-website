describe("contact", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } });
    cy.fixture("subjects").then((data) => {
      cy.intercept("GET", "**/api/subjects/", { statusCode: 200, body: data }).as("subjects");
    });
    cy.fixture("message_response").then((data) => {
      cy.intercept("POST", "**/api/messages/", { statusCode: 200, body: data }).as("sendMessage");
    });
  });

  it("submits the contact form", () => {
    cy.visit("/contact");

    cy.get("#last_name").type("Doe");
    cy.get("#first_name").type("Jane");
    cy.get("#telephone").type("0612345678");
    cy.get("#email").type("jane.doe@example.com");
    cy.get("#subject").select("10");
    cy.get("#message_content").type("Bonjour, ceci est un message de test.");
    cy.get("#consent").check();

    cy.wait(2100);
    cy.contains("button", "Contact").click();
    cy.contains(/Message envoy/).should("be.visible");
  });
});
