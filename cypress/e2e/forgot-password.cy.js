describe("forgot password", () => {
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.intercept("GET", "**/api/auth/me/", {
      statusCode: 401,
      body: { detail: "Unauthorized" },
    });
    cy.intercept("POST", "**/api/auth/password-reset/", {
      statusCode: 200,
      body: { ok: true },
    }).as("requestReset");
    cy.intercept("POST", "**/api/auth/password-reset-confirm/", {
      statusCode: 200,
      body: { ok: true },
    }).as("confirmReset");
  });

  // ── Page "Mot de passe oublié" ──────────────────────────────────────────

  it("affiche le formulaire de demande de réinitialisation", () => {
    cy.visit("/forgot-password");

    // Le h1 vient du locale fr : "Mot de passe oublie" (sans accent)
    cy.get("h1").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.contains("button", /envoyer/i).should("be.visible");
  });

  it("envoie l'e-mail et affiche un message de confirmation", () => {
    cy.visit("/forgot-password");

    cy.get("#email").type("melissa@example.com");
    cy.contains("button", /envoyer/i).click();
    cy.wait("@requestReset");

    // Message de succès : "Si un compte existe pour cet email..."
    cy.contains(/si un compte existe|lien de reinitialisation/i).should("be.visible");
  });

  it("le champ email a un label lié (accessibilité)", () => {
    cy.visit("/forgot-password");

    cy.get("label[for='email']").should("exist");
    cy.get("#email").should("exist");
  });

  // ── Page "Réinitialiser le mot de passe" ────────────────────────────────
  // Le composant lit ?uid=...&token=... — les deux sont requis pour activer
  // le bouton de soumission et permettre l'appel API.

  it("affiche le formulaire de réinitialisation avec un token valide", () => {
    cy.visit("/reset-password?uid=abc123&token=valid-token");

    cy.get("h1").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirmPassword").should("be.visible");
    cy.contains("button[type='submit'], button", /mettre a jour|update/i).should("be.visible");
  });

  it("réinitialise le mot de passe avec succès", () => {
    cy.visit("/reset-password?uid=abc123&token=valid-token");

    // Mot de passe valide : ≥8 car, 1 maj, 1 chiffre, 1 spécial
    cy.get("#password").type("NewPass1!");
    cy.get("#confirmPassword").type("NewPass1!");
    cy.contains("button", /mettre a jour|update/i).click();
    cy.wait("@confirmReset");

    // Message de succès : "Mot de passe mis a jour."
    cy.contains(/mot de passe mis a jour|password updated/i).should("be.visible");
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", () => {
    cy.visit("/reset-password?uid=abc123&token=valid-token");

    cy.get("#password").type("NewPass1!");
    cy.get("#confirmPassword").type("Different2!");
    cy.contains("button", /mettre a jour|update/i).click();

    // Message d'erreur lié au champ confirmPassword
    cy.get("#confirm-password-error").should("be.visible");
    cy.contains(/ne correspondent pas|do not match/i).should("be.visible");
  });
});
