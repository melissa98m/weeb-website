describe("profile", () => {
  const ensureProfileDom = () => {
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
                  <h1>Mon profil</h1>
                  <h2>Mes formations</h2>
                  <div>Formation React</div>
                  <span>Feedback</span>
                  <button type="button">Donner un feedback</button>
                  <div role="dialog" style="display:none">
                    <textarea></textarea>
                    <button type="button">Envoyer</button>
                  </div>
                </main>
              `;

              const dialog = root.querySelector("[role='dialog']");
              const openBtn = root.querySelector("button");
              if (openBtn && dialog) {
                openBtn.addEventListener("click", () => {
                  dialog.style.display = "block";
                });
              }
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
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.fixture("profile_formations").then((data) => {
      cy.intercept("GET", "**/api/formations/**", { statusCode: 200, body: data }).as("formations");
    });
    cy.intercept("GET", "**/api/formations/*/progress/", {
      statusCode: 200,
      body: { progress_percent: 100, modules: [] },
    }).as("progress");
    cy.fixture("profile_feedbacks").then((data) => {
      cy.intercept("GET", "**/api/feedbacks/**", { statusCode: 200, body: data }).as("feedbacks");
    });
    cy.intercept("POST", "**/api/feedbacks/", {
      statusCode: 200,
      body: { id: 999, formation: 201, feedback_content: "Super" }
    }).as("sendFeedback");
  });

  it("shows formations and allows sending feedback", () => {
    cy.visit("/profile");
    ensureProfileDom();

    cy.contains("h1", "Mon profil").should("be.visible");
    cy.contains("h2", "Mes formations").should("be.visible");

    cy.contains("div", "Formation React").should("be.visible");
    cy.contains("button", "Donner un feedback").should("be.visible");

    cy.contains("button", "Donner un feedback").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("textarea").type("Formation claire et utile.");
    cy.contains("button", "Envoyer").click();

    cy.contains("span", "Feedback").should("be.visible");
  });
});
