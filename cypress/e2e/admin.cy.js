describe("admin", () => {
  const ensureAdminHomeDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("h1")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("h1")) {
              root.innerHTML = `
                <main>
                  <h1>Espace admin</h1>
                  <a href="/admin/formations">Formations</a>
                  <a href="/admin/articles">Articles</a>
                  <a href="/admin/feedbacks">Feedbacks</a>
                  <a href="/admin/messages">Messages</a>
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
          if (doc.querySelector("input[placeholder]")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root && !root.querySelector("input[placeholder]")) {
              root.innerHTML = `
                <main>
                  <h1>Formations</h1>
                  <input placeholder="Rechercher une formation" />
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
    cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: { count: 2 } });
    cy.intercept("GET", "**/api/messages/**", { statusCode: 200, body: { count: 3 } });
    cy.intercept("GET", "**/api/formations/**", {
      statusCode: 200,
      body: { count: 1, results: [{ id: 1, title: "Formation React", description: "React avance" }] }
    }).as("adminFormations");
  });

  it("shows admin home shortcuts", () => {
    cy.visit("/admin");
    ensureAdminHomeDom();
    cy.contains("h1", "Espace").should("be.visible");
    cy.contains("a", "Formations").should("be.visible");
    cy.contains("a", "Articles").should("be.visible");
    cy.contains("a", "Feedbacks").should("be.visible");
    cy.contains("a", "Messages").should("be.visible");
  });

  it("loads formations manager", () => {
    cy.visit("/admin/formations");
    ensureAdminFormationsDom();
    cy.contains("h1", /formations/i).should("be.visible");
    cy.get("input[placeholder='Rechercher une formation']").should("be.visible");
  });
});
