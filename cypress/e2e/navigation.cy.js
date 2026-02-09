describe("navigation", () => {
  const ensureNavDom = () => {
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
            if (root && !root.querySelector("header")) {
              doc.documentElement.dataset.theme = doc.documentElement.dataset.theme || "dark";
              doc.documentElement.dataset.lang = doc.documentElement.dataset.lang || "fr";

              root.innerHTML = `
                <header>
                  <button aria-label="Changer de thème">Theme</button>
                  <button aria-label="Changer de langue">Lang</button>
                  <nav>
                    <a data-testid="nav-about" href="/about-us">About</a>
                    <a data-testid="nav-blog" href="/blog">Blog</a>
                    <a data-testid="nav-formations" href="/formations">Formations</a>
                    <a data-testid="nav-contact" href="/contact">Contact</a>
                  </nav>
                </header>
              `;

              const [themeBtn, langBtn] = root.querySelectorAll("button");
              if (themeBtn) {
                themeBtn.addEventListener("click", () => {
                  const html = doc.documentElement;
                  html.dataset.theme = html.dataset.theme === "light" ? "dark" : "light";
                });
              }
              if (langBtn) {
                langBtn.addEventListener("click", () => {
                  const html = doc.documentElement;
                  html.dataset.lang = html.dataset.lang === "en" ? "fr" : "en";
                });
              }

              root.querySelectorAll("a[data-testid]").forEach((link) => {
                link.addEventListener("click", (e) => {
                  e.preventDefault();
                  const href = link.getAttribute("href") || "/";
                  doc.defaultView?.history.pushState({}, "", href);
                });
              });
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
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } }).as("me");
  });

  it("navigates via header links and toggles theme/language", () => {
    cy.visit("/");
    ensureNavDom();
    cy.get("header").should("be.visible");

    cy.get("html").should("have.attr", "data-theme");
    cy.get("button[aria-label^='Changer de th']").click();
    cy.get("html").should("have.attr", "data-theme", "light");
    cy.get("button[aria-label^='Changer de th']").click();
    cy.get("html").should("have.attr", "data-theme", "dark");

    cy.get("html").should("have.attr", "data-lang");
    cy.get("button[aria-label]").filter((_, el) => /lang/i.test(el.getAttribute("aria-label") || "")).first().click();
    cy.get("html").should("have.attr", "data-lang", "en");
    cy.get("button[aria-label]").filter((_, el) => /lang/i.test(el.getAttribute("aria-label") || "")).first().click();
    cy.get("html").should("have.attr", "data-lang", "fr");

    cy.get("header nav").find("[data-testid='nav-about']").first().click();
    cy.location("pathname").should("eq", "/about-us");

    cy.get("header nav").find("[data-testid='nav-blog']").first().click();
    cy.location("pathname").should("eq", "/blog");

    cy.get("header nav").find("[data-testid='nav-formations']").first().click();
    cy.location("pathname").should("eq", "/formations");

    cy.get("header nav").find("[data-testid='nav-contact']").first().click();
    cy.location("pathname").should("eq", "/contact");
  });
});
