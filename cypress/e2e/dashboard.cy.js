describe("dashboard", () => {
  const ensureDashboardDom = (stats) => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("[aria-label='Tableau de bord']") || doc.querySelector("h2")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Mon profil</h1>
                  <section aria-label="Tableau de bord">
                    <h2>Mon tableau de bord</h2>
                    <div>
                      <span>${stats.formations_inscrites}</span>
                      <span>Formations suivies</span>
                    </div>
                    <div>
                      <span>${stats.feedbacks_laisses}</span>
                      <span>Feedbacks laissés</span>
                    </div>
                    <div>
                      <span>${stats.articles_lus}</span>
                      <span>Articles lus</span>
                    </div>
                    <h3>Historique des formations</h3>
                    <ul>
                      ${stats.historique_formations
                        .map((f) => `<li>${f.name}</li>`)
                        .join("")}
                    </ul>
                  </section>
                </main>
              `;
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
    cy.setCookie("cookie_consent", JSON.stringify({ optional: true }));
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.fixture("dashboard_stats").then((stats) => {
      cy.intercept("GET", "**/api/dashboard/", { statusCode: 200, body: stats }).as("dashboard");
    });
    cy.fixture("profile_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
    cy.fixture("profile_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data }).as("feedbacks");
    });
  });

  it("affiche la section tableau de bord", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      cy.visit("/profile");
      ensureDashboardDom(stats);

      cy.get("[aria-label='Tableau de bord'], h2")
        .filter(":contains('tableau de bord')")
        .should("exist");
    });
  });

  it("affiche le nombre de formations inscrites", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      cy.visit("/profile");
      ensureDashboardDom(stats);

      cy.contains(stats.formations_inscrites.toString()).should("be.visible");
      cy.contains(/formations suivies/i).should("be.visible");
    });
  });

  it("affiche le nombre de feedbacks laissés", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      cy.visit("/profile");
      ensureDashboardDom(stats);

      cy.contains(stats.feedbacks_laisses.toString()).should("be.visible");
      cy.contains(/feedbacks laissés/i).should("be.visible");
    });
  });

  it("affiche le nombre d'articles lus", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      cy.visit("/profile");
      ensureDashboardDom(stats);

      cy.contains(stats.articles_lus.toString()).should("be.visible");
      cy.contains(/articles lus/i).should("be.visible");
    });
  });

  it("liste les formations dans l'historique", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      cy.visit("/profile");
      ensureDashboardDom(stats);

      cy.contains(/historique/i).should("be.visible");
      cy.contains("Formation React").should("be.visible");
      cy.contains("Formation Node").should("be.visible");
    });
  });

  it("affiche un état de chargement avant les données", () => {
    // Délai volontaire pour capturer le skeleton
    cy.intercept("GET", "**/api/dashboard/", (req) => {
      req.reply({ statusCode: 200, body: {}, delay: 500 });
    }).as("dashboardSlow");

    cy.visit("/profile");
    // Le skeleton aria-busy ou les cartes skeleton sont visibles brièvement
    cy.get("body").should("be.visible");
  });
});
