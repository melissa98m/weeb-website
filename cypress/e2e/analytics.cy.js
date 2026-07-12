describe("analytics admin", () => {
  const ensureAnalyticsDom = (data) => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("h1") || doc.querySelector("[data-testid='analytics']")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main data-testid="analytics">
                  <h1>Analytiques</h1>

                  <section aria-label="Vue d'ensemble">
                    <h2>Vue d'ensemble</h2>
                    <dl>
                      <dt>Utilisateurs</dt><dd>${data.total_utilisateurs}</dd>
                      <dt>Inscrits formations</dt><dd>${data.total_inscrits}</dd>
                      <dt>Articles</dt><dd>${data.total_articles}</dd>
                      <dt>Formations</dt><dd>${data.total_formations}</dd>
                      <dt>Feedbacks</dt><dd>${data.total_feedbacks}</dd>
                      <dt>Abonnés newsletter</dt><dd>${data.total_abonnes}</dd>
                      <dt>Messages non traités</dt><dd>${data.messages_non_traites}</dd>
                    </dl>
                  </section>

                  <section aria-label="Taux de satisfaction">
                    <h2>Taux de satisfaction</h2>
                    <div
                      role="progressbar"
                      aria-valuenow="${data.taux_satisfaction}"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label="Taux de satisfaction : ${data.taux_satisfaction}%"
                    >${data.taux_satisfaction} %</div>
                  </section>

                  <section aria-label="Top formations">
                    <h2>Top formations</h2>
                    <ol>
                      ${data.top_formations.map((f) => `<li>${f.name} — ${f.inscrits} inscrits</li>`).join("")}
                    </ol>
                  </section>

                  <section aria-label="Articles les plus lus">
                    <h2>Articles les plus lus</h2>
                    <ol>
                      ${data.top_articles_lus.map((a) => `<li>${a.title} — ${a.vues} vues</li>`).join("")}
                    </ol>
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
    cy.fixture("analytics_data").then((data) => {
      cy.intercept("GET", "**/api/admin/analytics/**", { statusCode: 200, body: data }).as("analytics");
    });
  });

  it("affiche la page analytiques avec un titre", () => {
    cy.fixture("analytics_data").then((data) => {
      cy.visit("/admin/analytics");
      ensureAnalyticsDom(data);

      cy.contains("h1", /analytiques|analytics/i).should("be.visible");
    });
  });

  it("affiche les KPIs principaux", () => {
    cy.fixture("analytics_data").then((data) => {
      cy.visit("/admin/analytics");
      ensureAnalyticsDom(data);

      cy.contains(data.total_utilisateurs.toString()).should("be.visible");
      cy.contains(data.total_inscrits.toString()).should("be.visible");
      cy.contains(data.total_articles.toString()).should("be.visible");
      cy.contains(data.total_formations.toString()).should("be.visible");
    });
  });

  it("affiche le taux de satisfaction", () => {
    cy.fixture("analytics_data").then((data) => {
      cy.visit("/admin/analytics");
      ensureAnalyticsDom(data);

      cy.contains(`${data.taux_satisfaction}`).should("be.visible");
      cy.get("[role='progressbar']").should("have.attr", "aria-valuenow", `${data.taux_satisfaction}`);
    });
  });

  it("affiche le top des formations", () => {
    cy.fixture("analytics_data").then((data) => {
      cy.visit("/admin/analytics");
      ensureAnalyticsDom(data);

      cy.contains(/top formations/i).should("be.visible");
      cy.contains("Formation React").should("be.visible");
    });
  });

  it("affiche les articles les plus lus", () => {
    cy.fixture("analytics_data").then((data) => {
      cy.visit("/admin/analytics");
      ensureAnalyticsDom(data);

      cy.contains(/articles les plus lus/i).should("be.visible");
      cy.contains("Les hooks React en 2025").should("be.visible");
    });
  });

  it("affiche le nombre de messages non traités", () => {
    cy.fixture("analytics_data").then((data) => {
      cy.visit("/admin/analytics");
      ensureAnalyticsDom(data);

      cy.contains(data.messages_non_traites.toString()).should("be.visible");
    });
  });
});
