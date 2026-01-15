describe("navigation", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } }).as("me");
  });

  it("navigates via header links and toggles theme/language", () => {
    cy.visit("/");
    cy.get("header").should("be.visible");

    cy.get("html").should("have.attr", "data-theme");
    cy.get("button[aria-label^='Changer de th']").click();
    cy.get("html").should("have.attr", "data-theme", "light");
    cy.get("button[aria-label^='Changer de th']").click();
    cy.get("html").should("have.attr", "data-theme", "dark");

    cy.get("html").should("have.attr", "data-lang");
    cy.get("button[aria-label]").filter((_, el) => /lang/i.test(el.getAttribute("aria-label") || "")).first().click();
    cy.get("html").should("have.attr", "data-lang", "en");
    cy.get("button[aria-label]").filter((_, el) => /lang/i.test(el.getAttribute("aria-label") || "")).first().click();
    cy.get("html").should("have.attr", "data-lang", "fr");

    cy.get("header nav").find("[data-testid='nav-about']").first().click();
    cy.location("pathname").should("eq", "/about-us");

    cy.get("header nav").find("[data-testid='nav-blog']").first().click();
    cy.location("pathname").should("eq", "/blog");

    cy.get("header nav").find("[data-testid='nav-formations']").first().click();
    cy.location("pathname").should("eq", "/formations");

    cy.get("header nav").find("[data-testid='nav-contact']").first().click();
    cy.location("pathname").should("eq", "/contact");
  });
});
