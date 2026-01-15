describe("admin post endpoints", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
  });

  it("adds and removes a user-formation link", () => {
    cy.fixture("admin_users").then((data) => {
      cy.intercept("GET", "**/api/users/**", { statusCode: 200, body: data }).as("users");
    });
    cy.fixture("admin_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
    cy.fixture("admin_user_formations").then((data) => {
      cy.intercept("GET", "**/api/user-formations/**", { statusCode: 200, body: data }).as("links");
    });

    cy.intercept("POST", "**/api/user-formations/", {
      statusCode: 201,
      body: { id: 101, user: 1, formation: 10 }
    }).as("addLink");

    cy.intercept("DELETE", "**/api/user-formations/100/", { statusCode: 204 }).as("deleteLink");

    cy.visit("/admin/user-formations");
    cy.wait(["@users", "@formations", "@links"]);

    cy.get("#add-user").select("1");
    cy.get("#add-formation").select("10");
    cy.contains("button", "Ajouter").click();
    cy.wait("@addLink");

    cy.get("table").contains("button", "Retirer").first().click();
    cy.wait("@deleteLink");
  });

  it("creates and deletes a formation", () => {
    cy.fixture("admin_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
    cy.intercept("GET", "**/api/user-formations/**", { statusCode: 200, body: { results: [] } }).as("formationUsers");

    cy.intercept("POST", "**/api/formations/", {
      statusCode: 201,
      body: { id: 99, name: "Formation Cypress", description: "Test" }
    }).as("createFormation");

    cy.intercept("DELETE", "**/api/formations/99/", { statusCode: 204 }).as("deleteFormation");

    cy.visit("/admin/formations");
    cy.wait("@formations");

    cy.contains("button", "+ Nouvelle formation").click();
    cy.get("#formation-name").type("Formation Cypress");
    cy.get("#formation-description").type("Test");
    cy.contains("button", "Créer").click();
    cy.wait("@createFormation");

    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });
    cy.contains("button", "Supprimer").should("be.visible").click();
    cy.wait("@deleteFormation");
  });

  it("marks feedbacks and messages as processed", () => {
    cy.fixture("admin_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data }).as("feedbacks");
    });
    cy.intercept("PATCH", "**/api/feedbacks/7/", { statusCode: 200, body: { id: 7, to_process: true } }).as("patchFeedback");

    cy.visit("/admin/feedbacks");
    cy.wait("@feedbacks");
    cy.get("table").contains("button", "Marquer comme traité").first().click();
    cy.wait("@patchFeedback");

    cy.fixture("admin_messages").then((data) => {
      cy.intercept("GET", "**/api/messages/**", { statusCode: 200, body: data }).as("messages");
    });
    cy.intercept("PATCH", "**/api/messages/9/", { statusCode: 200, body: { id: 9, is_processed: true } }).as("patchMessage");

    cy.visit("/admin/messages");
    cy.wait("@messages");
    cy.get("table").contains("button", "Marquer comme traité").first().click();
    cy.wait("@patchMessage");
  });
});
