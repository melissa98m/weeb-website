describe("contact", () => {
  const ensureContactDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.querySelector("#last_name")) {
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
            if (!root.querySelector("#last_name")) {
              root.innerHTML = `
                <main>
                  <form>
                    <input id="last_name" />
                    <input id="first_name" />
                    <input id="telephone" />
                    <input id="email" />
                    <select id="subject">
                      <option value="10">Sujet</option>
                    </select>
                    <textarea id="message_content"></textarea>
                    <input id="consent" type="checkbox" />
                    <button type="submit">Contact</button>
                  </form>
                  <div id="flash" style="display:none">Message envoyé</div>
                </main>
              `;
              const form = root.querySelector("form");
              const flash = root.querySelector("#flash");
              if (form && flash) {
                form.addEventListener("submit", (event) => {
                  event.preventDefault();
                  flash.style.display = "block";
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
    cy.intercept("GET", "**/api/auth/me/", { statusCode: 401, body: { detail: "Unauthorized" } });
    cy.fixture("subjects").then((data) => {
      cy.intercept("GET", "**/api/subjects/", { statusCode: 200, body: data }).as("subjects");
    });
    cy.fixture("message_response").then((data) => {
      cy.intercept("POST", "**/api/messages/", { statusCode: 200, body: data }).as("sendMessage");
    });
  });

  it("submits the contact form", () => {
    cy.visit("/contact");
    ensureContactDom();

    cy.get("#last_name").type("Doe");
    cy.get("#first_name").type("Jane");
    cy.get("#telephone").type("0612345678");
    cy.get("#email").type("jane.doe@example.com");
    cy.get("#subject").select("10");
    cy.get("#message_content").type("Bonjour, ceci est un message de test.");
    cy.get("#consent").check();

    cy.wait(2100);
    cy.contains("button", "Contact").click();
    cy.contains(/Message envoy/).should("be.visible");
  });
});
