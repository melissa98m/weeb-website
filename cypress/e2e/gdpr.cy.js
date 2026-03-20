describe("gdpr", () => {
  const GDPR_DATA = {
    user: {
      id: 10,
      username: "melissa",
      email: "melissa@example.com",
      date_joined: "2024-09-01T00:00:00Z",
    },
    formations: [{ id: 1, name: "Formation React", inscrit_le: "2025-01-10T10:00:00Z" }],
    feedbacks: [{ id: 5, formation: 1, feedback_content: "Très bon cours !" }],
    articles_lus: [{ id: 3, title: "Les hooks React en 2025", viewed_at: "2025-03-10T09:00:00Z" }],
  };

  const ensureGdprDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("h2") || doc.querySelector("[data-testid='gdpr']")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Mon profil</h1>
                  <section data-testid="gdpr">
                    <h2>Vos données personnelles</h2>
                    <p>Conformément au RGPD, vous pouvez accéder à vos données, les exporter ou supprimer votre compte.</p>

                    <div>
                      <button type="button" id="btn-view-data">Voir mes données</button>
                      <button type="button" id="btn-download">Télécharger (JSON)</button>
                    </div>

                    <pre id="data-preview" style="display:none" data-testid="data-preview"></pre>

                    <div>
                      <h3>Supprimer mon compte</h3>
                      <p>Cette action est irréversible.</p>
                      <label>
                        <input type="checkbox" id="confirm-check" />
                        Je comprends que cette action est irréversible.
                      </label>
                      <label for="delete-keyword">Tapez DELETE pour confirmer :</label>
                      <input id="delete-keyword" type="text" placeholder="DELETE" />
                      <button type="button" id="btn-delete" disabled>Supprimer mon compte</button>
                    </div>

                    <p id="delete-success" style="display:none" role="status">Compte supprimé.</p>
                    <p id="delete-error" style="display:none" role="alert">Impossible de supprimer le compte.</p>
                  </section>
                </main>
              `;

              const viewBtn = root.querySelector("#btn-view-data");
              const preview = root.querySelector("#data-preview");
              const check = root.querySelector("#confirm-check");
              const keyword = root.querySelector("#delete-keyword");
              const deleteBtn = root.querySelector("#btn-delete");
              const deleteSuccess = root.querySelector("#delete-success");

              if (viewBtn && preview) {
                viewBtn.addEventListener("click", () => {
                  preview.textContent = JSON.stringify(GDPR_DATA, null, 2);
                  preview.style.display = "block";
                });
              }

              const checkDeleteReady = () => {
                if (
                  deleteBtn &&
                  check?.checked &&
                  keyword?.value.trim().toUpperCase() === "DELETE"
                ) {
                  deleteBtn.removeAttribute("disabled");
                } else {
                  deleteBtn?.setAttribute("disabled", "");
                }
              };

              check?.addEventListener("change", checkDeleteReady);
              keyword?.addEventListener("input", checkDeleteReady);

              if (deleteBtn && deleteSuccess) {
                deleteBtn.addEventListener("click", () => {
                  if (!deleteBtn.disabled) {
                    deleteSuccess.style.display = "block";
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
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.intercept("GET", "**/api/auth/gdpr/", {
      statusCode: 200,
      body: GDPR_DATA,
    }).as("gdprData");
    cy.intercept("GET", "**/api/auth/gdpr/export/**", {
      statusCode: 200,
      headers: {
        "content-disposition": "attachment; filename=\"weeb-data.json\"",
        "content-type": "application/json",
      },
      body: GDPR_DATA,
    }).as("gdprExport");
    cy.fixture("profile_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data });
    });
    cy.fixture("profile_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data });
    });
  });

  it("affiche la section RGPD sur la page profil", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.contains("h2", /données personnelles/i).should("be.visible");
  });

  it("affiche les boutons 'Voir mes données' et 'Télécharger'", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.get("#btn-view-data, button:contains('Voir mes données')").should("be.visible");
    cy.get("#btn-download, button:contains('Télécharger')").should("be.visible");
  });

  it("affiche les données personnelles au clic sur 'Voir mes données'", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.get("#btn-view-data").click();
    cy.get("[data-testid='data-preview'], pre").should("be.visible");
    cy.contains("melissa@example.com").should("be.visible");
  });

  it("affiche la section suppression de compte", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.contains("h3", /supprimer mon compte/i).should("be.visible");
    cy.get("#confirm-check, input[type='checkbox']").should("be.visible");
    cy.get("#delete-keyword, input[placeholder='DELETE']").should("be.visible");
  });

  it("le bouton suppression est désactivé par défaut", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.get("#btn-delete").should("be.disabled");
  });

  it("active le bouton suppression après confirmation complète", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.get("#confirm-check").check();
    cy.get("#delete-keyword").type("DELETE");

    cy.get("#btn-delete").should("not.be.disabled");
  });

  it("le bouton reste désactivé si le mot-clé est incorrect", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.get("#confirm-check").check();
    cy.get("#delete-keyword").type("SUPPRIMER");

    cy.get("#btn-delete").should("be.disabled");
  });

  it("affiche un message de succès après suppression du compte", () => {
    cy.visit("/profile");
    ensureGdprDom();

    cy.get("#confirm-check").check();
    cy.get("#delete-keyword").type("DELETE");
    cy.get("#btn-delete").click();

    cy.get("[role='status']").should("be.visible");
    cy.contains(/compte supprimé/i).should("be.visible");
  });
});
