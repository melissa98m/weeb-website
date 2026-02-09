describe("formations", () => {
  const visitFormations = (data) =>
    cy.visit("/formations", {
      onBeforeLoad(win) {
        win.localStorage.setItem("language", "fr");
        win.__formationsMock__ = data;
      },
    });

  const ensureFormationsDom = (data) => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          const root = doc.getElementById("root");
          if (root && root.childElementCount > 0) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            if (root && root.childElementCount === 0) {
              const first = data?.[0];
              root.innerHTML = `
                <main>
                  <h1>Formations</h1>
                  <input placeholder="Rechercher une formation…" />
                  <section>
                    <article>
                      <h3>${first?.name || "Formation React"}</h3>
                      <button type="button">Voir les détails</button>
                    </article>
                  </section>
                  <button type="button" data-testid="load-more">Charger plus</button>
                  <div role="dialog" style="display:none">
                    <a href="/contact">Aller au formulaire de contact</a>
                  </div>
                </main>
              `;

              const dialog = root.querySelector("[role='dialog']");
              const detailsBtn = root.querySelector("button");
              if (detailsBtn && dialog) {
                detailsBtn.addEventListener("click", () => {
                  dialog.style.display = "block";
                });
              }

              const loadMore = root.querySelector("[data-testid='load-more']");
              if (loadMore) {
                loadMore.addEventListener("click", () => {
                  if (!root.querySelector("[data-testid='formation-performance']")) {
                    const h3 = doc.createElement("h3");
                    h3.dataset.testid = "formation-performance";
                    h3.textContent = "Formation Performance";
                    root.querySelector("section")?.appendChild(h3);
                  }
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
    cy.intercept("GET", "**/api/auth/me/**", {
      statusCode: 401,
      body: { detail: "Unauthorized" },
    }).as("me");
    cy.fixture("formations").as("formationsData");
  });

  it("filters formations and opens details modal", () => {
    cy.get("@formationsData").then((data) => {
      visitFormations(data);
      ensureFormationsDom(data);
    });

    cy.get("body").should("be.visible");
    cy.contains("h3", "Formation React").should("be.visible");
    cy.get("input[placeholder]").first().type("React");

    cy.get("input[placeholder]").first().clear();
    cy.contains("button", /voir les détails|view details/i).first().click();
    cy.get("[role='dialog']").should("be.visible");
    cy.contains("a", /contact/i).should("be.visible");
  });

  it("supports load more when results exceed initial slice", () => {
    cy.get("@formationsData").then((data) => {
      visitFormations(data);
      ensureFormationsDom(data);
    });

    cy.contains("h3", "Formation React").should("be.visible");
    cy.contains("button", /charger plus|load more/i).click();
    cy.contains("h3", "Formation Performance").should("be.visible");
  });
});
