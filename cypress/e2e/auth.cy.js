describe("auth", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
  });

  it("logs in and returns to home", () => {
    cy.fixture("auth_user").then((user) => {
      cy.intercept("POST", "**/api/auth/login/", { statusCode: 200, body: { ok: true } }).as("login");
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");

      cy.visit("/login");
      cy.get("#identifier").type("melissa");
      cy.get("#password").type("Test123!");
      cy.get("#identifier")
        .closest("form")
        .within(() => {
          cy.get("button[type='submit']").click();
        });

      cy.location("pathname").should("eq", "/");
      cy.contains("a", "melissa").should("be.visible");
    });
  });

  it("registers a new user", () => {
    cy.fixture("auth_user").then((user) => {
      cy.intercept("POST", "**/api/auth/register/", { statusCode: 200, body: { ok: true } }).as("register");
      cy.intercept("POST", "**/api/auth/login/", { statusCode: 200, body: { ok: true } }).as("login");
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");

      cy.visit("/register");
      cy.get("#username").type("melissa");
      cy.get("#nom").type("Doe");
      cy.get("#prenom").type("Jane");
      cy.get("#email").type("jane.doe@example.com");
      cy.get("#telephone").type("0612345678");
      cy.get("#password").type("Test123!");
      cy.get("#confirmPassword").type("Test123!");

      cy.get("#username")
        .closest("form")
        .within(() => {
          cy.get("button[type='submit']").click();
        });
      cy.location("pathname").should("eq", "/");
    });
  });

  it("logs out from the header", () => {
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
      cy.intercept("POST", "**/api/auth/logout/", { statusCode: 200, body: { ok: true } }).as("logout");

      cy.visit("/profile");
      cy.wait("@me");
      cy.visit("/");
      cy.contains("a", "melissa").should("be.visible");
      cy.contains("button", "Se déconnecter").click();
      cy.wait("@logout");

      cy.contains("a", "melissa").should("not.exist");
      cy.location("pathname").should("eq", "/login");
      cy.get("header").find("a[href='/register']").filter(":visible").should("be.visible");
    });
  });
});
