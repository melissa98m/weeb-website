describe("cookies banner", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("accepts optional cookies and stores consent", () => {
    cy.contains("Cookies et vie privee").should("be.visible");
    cy.get('input[type="checkbox"][disabled]').should("be.checked");
    cy.get('input[type="checkbox"]:not([disabled])').should("not.be.checked");

    cy.contains("button", "Tout accepter").click();
    cy.contains("Cookies et vie privee").should("not.exist");
    cy.get('button[aria-label="Gerer les cookies"]').should("be.visible");

    cy.getCookie("cookie_consent").should("exist").then((cookie) => {
      const parsed = JSON.parse(decodeURIComponent(cookie.value));
      expect(parsed.optional).to.eq(true);
    });
  });

  it("opens manage and refuses optional cookies", () => {
    cy.contains("button", "Refuser").click();
    cy.get('button[aria-label="Gerer les cookies"]').should("be.visible");
    cy.get('button[aria-label="Gerer les cookies"]').click();
    cy.contains("Cookies et vie privee").should("be.visible");

    cy.get('input[type="checkbox"]:not([disabled])').should("not.be.checked");
    cy.contains("button", "Refuser").click();

    cy.getCookie("cookie_consent").should("exist").then((cookie) => {
      const parsed = JSON.parse(decodeURIComponent(cookie.value));
      expect(parsed.optional).to.eq(false);
    });
  });
});
