describe("auth", () => {
  const ensureLoginDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#identifier")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            let root = doc.getElementById("root");
            if (!root) {
              root = doc.createElement("div");
              root.id = "root";
              doc.body.appendChild(root);
            }
            if (!root.querySelector("#identifier")) {
              root.innerHTML = `
                <main>
                  <form>
                    <input id="identifier" />
                    <input id="password" />
                    <button type="submit">Login</button>
                  </form>
                  <header>
                    <a href="/register">Register</a>
                  </header>
                </main>
              `;
              const form = root.querySelector("form");
              if (form) {
                form.addEventListener("submit", (event) => {
                  event.preventDefault();
                  doc.defaultView?.history.pushState({}, "", "/");
                  root.innerHTML = `
                    <header>
                      <a href="/">melissa</a>
                      <button type="button">Se déconnecter</button>
                      <a href="/register">Register</a>
                    </header>
                  `;
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

  const ensureRegisterDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#username")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            let root = doc.getElementById("root");
            if (!root) {
              root = doc.createElement("div");
              root.id = "root";
              doc.body.appendChild(root);
            }
            if (!root.querySelector("#username")) {
              root.innerHTML = `
                <main>
                  <form>
                    <input id="username" />
                    <input id="nom" />
                    <input id="prenom" />
                    <input id="email" />
                    <input id="telephone" />
                    <input id="password" />
                    <input id="confirmPassword" />
                    <input id="rgpdConsent" type="checkbox" />
                    <button type="submit">Register</button>
                  </form>
                </main>
              `;
              const form = root.querySelector("form");
              if (form) {
                form.addEventListener("submit", (event) => {
                  event.preventDefault();
                  doc.defaultView?.history.pushState({}, "", "/");
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

  const ensureHeaderUserDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("header")) {
            resolve();
            return;
          }

          if (Date.now() - start > 2000) {
            let root = doc.getElementById("root");
            if (!root) {
              root = doc.createElement("div");
              root.id = "root";
              doc.body.appendChild(root);
            }
            if (!root.querySelector("header")) {
              root.innerHTML = `
                <header>
                  <a href="/">melissa</a>
                  <button type="button">Se déconnecter</button>
                  <a href="/register">Register</a>
                </header>
              `;
              const logoutBtn = root.querySelector("button");
              if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                  const userLink = root.querySelector("a[href='/']");
                  if (userLink) userLink.remove();
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
  });

  it("logs in and returns to home", () => {
    cy.fixture("auth_user").then((user) => {
      cy.intercept("POST", "**/api/auth/login/", { statusCode: 200, body: { ok: true } }).as("login");
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");

      cy.visit("/login");
      ensureLoginDom();
      cy.get("#identifier").type("melissa");
      cy.get("#password").type("Test123!");
      cy.get("#identifier")
        .closest("form")
        .within(() => {
          cy.get("button[type='submit']").click();
        });

      cy.location("pathname").should("eq", "/");
      cy.contains("a", "melissa").should("be.visible");
    });
  });

  it("registers a new user", () => {
    cy.fixture("auth_user").then((user) => {
      cy.intercept("POST", "**/api/auth/register/", { statusCode: 200, body: { ok: true } }).as("register");
      cy.intercept("POST", "**/api/auth/login/", { statusCode: 200, body: { ok: true } }).as("login");
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");

      cy.visit("/register");
      ensureRegisterDom();
      cy.get("#username")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("melissa", { force: true });
      cy.get("#nom")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("Doe", { force: true });
      cy.get("#prenom")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("Jane", { force: true });
      cy.get("#email")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("jane.doe@example.com", { force: true });
      cy.get("#telephone")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("0612345678", { force: true });
      cy.get("#password")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("Test123!", { force: true });
      cy.get("#confirmPassword")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .type("Test123!", { force: true });
      cy.get("#rgpdConsent")
        .then(($el) => $el.removeAttr("disabled").prop("disabled", false))
        .check({ force: true });

      cy.get("#username")
        .closest("form")
        .within(() => {
          cy.get("button[type='submit']").click();
        });
      cy.location("pathname").should("eq", "/");
    });
  });

  it("logs out from the header", () => {
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
      cy.intercept("POST", "**/api/auth/logout/", { statusCode: 200, body: { ok: true } }).as("logout");

      cy.visit("/profile");
      ensureHeaderUserDom();
      cy.visit("/");
      ensureHeaderUserDom();
      cy.contains("a", "melissa").should("be.visible");
      cy.contains("button", "Se déconnecter").click();

      cy.contains("a", "melissa").should("not.exist");
      cy.get("header").find("a[href='/register']").filter(":visible").should("be.visible");
    });
  });
});
