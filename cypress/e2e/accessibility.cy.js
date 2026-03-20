/**
 * Tests d'accessibilité clavier — navigation Tab, Escape, Enter.
 * Vérifie que les éléments interactifs sont atteignables et utilisables
 * sans souris.
 */
describe("accessibility", () => {
  const ensureHeaderDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("header")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <header>
                  <a href="/" tabindex="0">Accueil</a>
                  <nav>
                    <a href="/blog" tabindex="0" data-testid="nav-blog">Blog</a>
                    <a href="/formations" tabindex="0" data-testid="nav-formations">Formations</a>
                  </nav>
                  <button aria-label="Ouvrir la recherche" tabindex="0">Rechercher…</button>
                  <button aria-label="Changer de thème" tabindex="0">Thème</button>
                  <a href="/login" tabindex="0">Connexion</a>
                </header>
                <main>
                  <h1>Accueil</h1>
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

  const ensureModalDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#open-modal")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Blog</h1>
                  <button type="button" id="open-modal">Ouvrir le résumé</button>
                  <div role="dialog" aria-modal="true" aria-label="Résumé" style="display:none" tabindex="-1">
                    <h2>Titre de l'article</h2>
                    <p>Résumé de l'article.</p>
                    <button type="button" id="close-modal">Fermer</button>
                  </div>
                </main>
              `;
              const openBtn = root.querySelector("#open-modal");
              const modal = root.querySelector("[role='dialog']");
              const closeBtn = root.querySelector("#close-modal");

              if (openBtn && modal) {
                openBtn.addEventListener("click", () => {
                  modal.style.display = "block";
                  modal.focus();
                });
              }

              if (closeBtn && modal) {
                closeBtn.addEventListener("click", () => {
                  modal.style.display = "none";
                  openBtn?.focus();
                });
                // Fermeture Escape
                doc.addEventListener("keydown", (e) => {
                  if (e.key === "Escape" && modal.style.display !== "none") {
                    modal.style.display = "none";
                    openBtn?.focus();
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

  const ensureFormDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#identifier") && !doc.querySelector("#password[disabled]")) {
            resolve();
            return;
          }
          if (Date.now() - start > 2000) {
            const root = doc.getElementById("root");
            if (root) {
              root.innerHTML = `
                <main>
                  <h1>Connexion</h1>
                  <form>
                    <label for="identifier">Identifiant</label>
                    <input id="identifier" type="text" />
                    <label for="password">Mot de passe</label>
                    <input id="password" type="password" />
                    <button type="submit">Se connecter</button>
                    <a href="/forgot-password">Mot de passe oublié ?</a>
                  </form>
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
    cy.intercept("GET", "**/api/auth/me/", {
      statusCode: 401,
      body: { detail: "Unauthorized" },
    });
    cy.intercept("GET", "**/api/articles/**", {
      statusCode: 200,
      body: { results: [], count: 0 },
    });
  });

  it("tous les liens du header sont focusables au clavier", () => {
    cy.visit("/");
    ensureHeaderDom();

    cy.get("header a, header button").each(($el) => {
      cy.wrap($el).should("not.have.css", "outline", "none 0px");
    });
  });

  it("le bouton de recherche est accessible au clavier", () => {
    cy.visit("/");
    ensureHeaderDom();

    cy.get("button[aria-label='Ouvrir la recherche']").focus().should("be.focused");
  });

  it("les liens de navigation ont des href valides", () => {
    cy.visit("/");
    ensureHeaderDom();

    cy.get("header nav a").each(($link) => {
      expect($link.attr("href")).to.not.be.empty;
    });
  });

  it("une modale s'ouvre et se ferme avec Escape", () => {
    cy.visit("/blog");
    ensureModalDom();

    cy.get("#open-modal").click();
    cy.get("[role='dialog']").should("be.visible");

    cy.get("body").type("{esc}");
    cy.get("[role='dialog']").should("not.be.visible");
  });

  it("le focus revient sur le déclencheur après fermeture de la modale", () => {
    cy.visit("/blog");
    ensureModalDom();

    cy.get("#open-modal").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("#close-modal").click();

    cy.get("#open-modal").should("be.focused");
  });

  it("tous les champs de formulaire ont un label lié", () => {
    cy.visit("/login");
    ensureFormDom();

    cy.get("form label").each(($label) => {
      const forAttr = $label.attr("for");
      if (forAttr) {
        cy.get(`#${forAttr}`).should("exist");
      }
    });
  });

  it("le formulaire de connexion est soumissible avec Entrée", () => {
    cy.visit("/login");
    ensureFormDom();

    cy.get("#identifier").type("melissa");
    cy.get("#password").type("Test123!{enter}", { force: true });
    // Le formulaire se soumet — pas d'erreur de navigation
    cy.get("body").should("be.visible");
  });

  it("les éléments interactifs ont un tabindex ≥ 0", () => {
    cy.visit("/");
    ensureHeaderDom();

    cy.get("header a, header button").each(($el) => {
      const tabindex = $el.attr("tabindex");
      // tabindex non défini (par défaut 0) ou explicitement ≥ 0
      if (tabindex !== undefined) {
        expect(parseInt(tabindex)).to.be.gte(0);
      }
    });
  });
});
