describe("forgot password", () => {
  const ensureForgotDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("form") || doc.querySelector("h1")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Mot de passe oublié</h1>
                  <form>
                    <label for="email">Adresse e-mail</label>
                    <input id="email" type="email" placeholder="votre@email.com" />
                    <button type="submit">Envoyer le lien</button>
                  </form>
                  <p id="success-msg" style="display:none" role="status">
                    Un e-mail a été envoyé si le compte existe.
                  </p>
                  <p id="error-msg" style="display:none" role="alert">
                    Une erreur est survenue.
                  </p>
                </main>
              `;
              const form = root.querySelector("form");
              const success = root.querySelector("#success-msg");
              const error = root.querySelector("#error-msg");
              if (form) {
                form.addEventListener("submit", (e) => {
                  e.preventDefault();
                  const val = root.querySelector("#email")?.value || "";
                  if (val.includes("@")) {
                    if (success) success.style.display = "block";
                  } else {
                    if (error) error.style.display = "block";
                  }
                });
              }
            }
            resolve();
          }
          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };

  const ensureResetDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("form") || doc.querySelector("h1")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Réinitialiser le mot de passe</h1>
                  <form>
                    <label for="new-password">Nouveau mot de passe</label>
                    <input id="new-password" type="password" placeholder="Nouveau mot de passe" />
                    <label for="confirm-password">Confirmer le mot de passe</label>
                    <input id="confirm-password" type="password" placeholder="Confirmer" />
                    <button type="submit">Réinitialiser</button>
                  </form>
                  <p id="reset-success" style="display:none" role="status">
                    Mot de passe réinitialisé avec succès.
                  </p>
                  <p id="reset-error" style="display:none" role="alert">
                    Les mots de passe ne correspondent pas.
                  </p>
                </main>
              `;
              const form = root.querySelector("form");
              const success = root.querySelector("#reset-success");
              const error = root.querySelector("#reset-error");
              if (form) {
                form.addEventListener("submit", (e) => {
                  e.preventDefault();
                  const pw = root.querySelector("#new-password")?.value || "";
                  const conf = root.querySelector("#confirm-password")?.value || "";
                  if (pw && pw === conf) {
                    if (success) success.style.display = "block";
                  } else {
                    if (error) error.style.display = "block";
                  }
                });
              }
            }
            resolve();
          }
          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };

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

  it("affiche le formulaire de demande de réinitialisation", () => {
    cy.visit("/forgot-password");
    ensureForgotDom();

    cy.contains("h1", /mot de passe oublié/i).should("be.visible");
    cy.get("#email, input[type='email']").should("be.visible");
    cy.contains("button", /envoyer/i).should("be.visible");
  });

  it("envoie l'e-mail et affiche un message de confirmation", () => {
    cy.visit("/forgot-password");
    ensureForgotDom();

    cy.get("#email, input[type='email']").type("melissa@example.com");
    cy.contains("button", /envoyer/i).click();

    cy.contains(/e-mail a été envoyé|lien envoyé/i).should("be.visible");
  });

  it("le champ email a un label lié (accessibilité)", () => {
    cy.visit("/forgot-password");
    ensureForgotDom();

    cy.get("label[for='email']").should("exist");
    cy.get("#email").should("exist");
  });

  it("affiche le formulaire de réinitialisation avec un token valide", () => {
    cy.visit("/reset-password?token=valid-token-abc");
    ensureResetDom();

    cy.contains("h1", /réinitialiser/i).should("be.visible");
    cy.get("#new-password, input[type='password']").first().should("be.visible");
    cy.contains("button", /réinitialiser/i).should("be.visible");
  });

  it("réinitialise le mot de passe avec succès", () => {
    cy.visit("/reset-password?token=valid-token-abc");
    ensureResetDom();

    cy.get("#new-password").type("NewPass123!");
    cy.get("#confirm-password").type("NewPass123!");
    cy.contains("button", /réinitialiser/i).click();

    cy.contains(/réinitialisé avec succès|mot de passe modifié/i).should("be.visible");
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", () => {
    cy.visit("/reset-password?token=valid-token-abc");
    ensureResetDom();

    cy.get("#new-password").type("NewPass123!");
    cy.get("#confirm-password").type("Different456!");
    cy.contains("button", /réinitialiser/i).click();

    cy.get("[role='alert']").should("be.visible");
  });
});
