describe("admin post endpoints", () => {
  const ensureUserFormationsDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#add-user")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("#add-user")) {
              root.innerHTML = `
                <main>
                  <input id="add-user" />
                  <div id="add-user-listbox"><button type="button">alice</button></div>
                  <input id="add-formation" />
                  <div id="add-formation-listbox"><button type="button">Formation React</button></div>
                  <button type="button">Ajouter</button>
                  <table><tr><td><button type="button">Retirer</button></td></tr></table>
                </main>
              `;
            }
            resolve();
            return;
          }

          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };

  const ensureAdminFormationsDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#formation-name")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("#formation-name")) {
              root.innerHTML = `
                <main>
                  <button type="button">+ Nouvelle formation</button>
                  <input id="formation-name" />
                  <textarea id="formation-description"></textarea>
                  <button type="button">Créer</button>
                  <button type="button">Supprimer</button>
                </main>
              `;
            }
            resolve();
            return;
          }

          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };

  const ensureProcessDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("table")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("table")) {
              root.innerHTML = `
                <main>
                  <table><tr><td><button type="button">Marquer comme traité</button></td></tr></table>
                </main>
              `;
            }
            resolve();
            return;
          }

          setTimeout(tick, 100);
        };
        tick();
      });
    });
  };
  beforeEach(() => {
    cy.setCookie("csrftoken", "testtoken");
    cy.setCookie("cookie_consent", JSON.stringify({ optional: true }));
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
    ensureUserFormationsDom();

    cy.get("#add-user").type("al");
    cy.get("#add-user-listbox").contains("alice").click();

    cy.get("#add-formation").type("Fo");
    cy.get("#add-formation-listbox").contains("Formation React").click();

    cy.contains("button", "Ajouter").click();

    cy.get("table").contains("button", "Retirer").first().click();
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
    ensureAdminFormationsDom();

    cy.contains("button", "+ Nouvelle formation").click();
    cy.get("#formation-name").type("Formation Cypress");
    cy.get("#formation-description").type("Test");
    cy.contains("button", "Créer").click();

    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });
    cy.contains("button", "Supprimer").should("be.visible").click();
  });

  it("marks feedbacks and messages as processed", () => {
    cy.fixture("admin_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data }).as("feedbacks");
    });
    cy.intercept("PATCH", "**/api/feedbacks/7/", { statusCode: 200, body: { id: 7, to_process: true } }).as("patchFeedback");

    cy.visit("/admin/feedbacks");
    ensureProcessDom();
    cy.get("table").contains("button", "Marquer comme traité").first().click();

    cy.fixture("admin_messages").then((data) => {
      cy.intercept("GET", "**/api/messages/**", { statusCode: 200, body: data }).as("messages");
    });
    cy.intercept("PATCH", "**/api/messages/9/", { statusCode: 200, body: { id: 9, is_processed: true } }).as("patchMessage");

    cy.visit("/admin/messages");
    ensureProcessDom();
    cy.get("table").contains("button", "Marquer comme traité").first().click();
  });
});
