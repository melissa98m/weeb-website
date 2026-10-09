describe("dashboard", () => {
  // Since the sidebar layout (8a203f1), the stat counters live in the sidebar
  // mini-stats card with short labels, and the main <section> only renders the
  // formations timeline (DashboardStats with hideCards).
  const DASHBOARD_REGION = "section[aria-label='Mon tableau de bord']";

  // Waits for real data: the region renders once auth resolves, and the
  // aria-busy skeleton goes away once the dashboard response is applied.
  // Longer timeout because CI runners are noticeably slower than local runs.
  const visitProfile = () => {
    cy.visit("/profile");
    cy.wait("@dashboard");
    cy.get(DASHBOARD_REGION, { timeout: 10000 }).should("exist");
    cy.get(`${DASHBOARD_REGION} [aria-busy='true']`, { timeout: 10000 }).should("not.exist");
  };

  const miniStat = (label) => cy.contains("aside p", new RegExp(`^${label}$`)).parent();

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
    visitProfile();

    cy.get(DASHBOARD_REGION).should("be.visible").and("contain.text", "Mon tableau de bord");
  });

  it("affiche le nombre de formations inscrites", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      visitProfile();

      miniStat("Formations")
        .should("be.visible")
        .and("contain.text", stats.formations_inscrites.toString());
    });
  });

  it("affiche le nombre de feedbacks laissés", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      visitProfile();

      miniStat("Avis")
        .should("be.visible")
        .and("contain.text", stats.feedbacks_laisses.toString());
    });
  });

  it("affiche le nombre d'articles lus", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      visitProfile();

      miniStat("Articles")
        .should("be.visible")
        .and("contain.text", stats.articles_lus.toString());
    });
  });

  it("liste les formations dans l'historique", () => {
    cy.fixture("dashboard_stats").then((stats) => {
      visitProfile();

      cy.get(DASHBOARD_REGION).within(() => {
        cy.contains("h3", /formations récentes/i).should("be.visible");
        stats.historique_formations.forEach((f) => {
          cy.contains(f.name).should("be.visible");
        });
      });
    });
  });

  it("affiche un état de chargement avant les données", () => {
    // Delay the response so the aria-busy skeleton can be observed
    cy.fixture("dashboard_stats").then((stats) => {
      cy.intercept("GET", "**/api/dashboard/", {
        statusCode: 200,
        body: stats,
        delay: 1000,
      }).as("dashboardSlow");
    });

    cy.visit("/profile");
    cy.get(`${DASHBOARD_REGION} [aria-busy='true']`).should("exist");
    cy.wait("@dashboardSlow");
    cy.get(`${DASHBOARD_REGION} [aria-busy='true']`).should("not.exist");
  });
});
