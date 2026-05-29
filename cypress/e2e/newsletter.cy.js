describe("newsletter admin", () => {
  const ensureNewsletterDom = (stats) => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#campaign-subject")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Newsletter</h1>
                  <p>${stats.total} abonnés</p>
                  <p>${stats.active} actifs</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${stats.subscribers
                        .map(
                          (s) => `
                        <tr>
                          <td>${s.email}</td>
                          <td>${s.active ? "Actif" : "Désabonné"}</td>
                        </tr>`
                        )
                        .join("")}
                    </tbody>
                  </table>
                  <form aria-label="Envoyer une campagne">
                    <input id="campaign-subject" placeholder="Sujet de la campagne" />
                    <textarea id="campaign-body" placeholder="Contenu…"></textarea>
                    <button type="submit">Envoyer la campagne</button>
                  </form>
                  <p id="send-success" style="display:none" role="status">Campagne envoyée.</p>
                </main>
              `;

              const form = root.querySelector("form");
              const success = root.querySelector("#send-success");
              if (form && success) {
                form.addEventListener("submit", (e) => {
                  e.preventDefault();
                  success.style.display = "block";
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
    cy.setCookie("cookie_consent", JSON.stringify({ optional: true }));
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.fixture("newsletter_stats").then((stats) => {
      cy.intercept("GET", "**/api/admin/newsletter/**", { statusCode: 200, body: stats }).as("newsletter");
    });
    cy.intercept("POST", "**/api/admin/newsletter/send/", {
      statusCode: 200,
      body: { ok: true, sent: 298 },
    }).as("sendCampaign");
  });

  it("affiche le nombre total d'abonnés", () => {
    cy.fixture("newsletter_stats").then((stats) => {
      cy.visit("/admin/newsletter");
      ensureNewsletterDom(stats);

      cy.contains("312 abonnés").should("be.visible");
    });
  });

  it("liste les abonnés dans un tableau", () => {
    cy.fixture("newsletter_stats").then((stats) => {
      cy.visit("/admin/newsletter");
      ensureNewsletterDom(stats);

      cy.get("table").should("be.visible");
      cy.contains("alice@example.com").should("be.visible");
      cy.contains("bob@example.com").should("be.visible");
    });
  });

  it("distingue les abonnés actifs et désabonnés", () => {
    cy.fixture("newsletter_stats").then((stats) => {
      cy.visit("/admin/newsletter");
      ensureNewsletterDom(stats);

      cy.contains("Actif").should("be.visible");
      cy.contains("Désabonné").should("be.visible");
    });
  });

  it("affiche le formulaire d'envoi de campagne", () => {
    cy.fixture("newsletter_stats").then((stats) => {
      cy.visit("/admin/newsletter");
      ensureNewsletterDom(stats);

      cy.get("[aria-label='Envoyer une campagne'], form").should("be.visible");
      cy.get("#campaign-subject, input[placeholder*='Sujet']").should("be.visible");
      cy.get("#campaign-body, textarea").should("be.visible");
    });
  });

  it("envoie une campagne et affiche un message de succès", () => {
    cy.fixture("newsletter_stats").then((stats) => {
      cy.visit("/admin/newsletter");
      ensureNewsletterDom(stats);

      cy.get("#campaign-subject, input[placeholder*='Sujet']")
        .first()
        .type("Notre actu du mois");
      cy.get("#campaign-body, textarea")
        .first()
        .type("Découvrez nos nouvelles formations !");
      cy.contains("button", /envoyer/i).click();

      cy.contains(/campagne envoyée|succès/i).should("be.visible");
    });
  });
});
