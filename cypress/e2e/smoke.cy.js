describe("homepage", () => {
  it("loads successfully", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
  });
});
