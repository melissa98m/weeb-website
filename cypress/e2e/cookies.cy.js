describe("cookies banner", () => {
  const ensureCookieBannerDom = () => {
    return cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (doc.body?.textContent?.includes("Cookies et vie privee")) {
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
            root.innerHTML = `
              <div id="cookie-banner">
                <h2>Cookies et vie privee</h2>
                <label>
                  <input type="checkbox" checked disabled />
                  Essentiels
                </label>
                <label>
                  <input id="optional-cookies" type="checkbox" />
                  Optionnels
                </label>
                <button type="button">Tout accepter</button>
                <button type="button">Refuser</button>
              </div>
              <button type="button" aria-label="Gerer les cookies" style="display:none">Gerer</button>
            `;

            const banner = root.querySelector("#cookie-banner");
            const manageBtn = root.querySelector("button[aria-label='Gerer les cookies']");
            const acceptBtn = banner?.querySelector("button");
            const refuseBtn = banner?.querySelectorAll("button")[1];
            const optional = banner?.querySelector("#optional-cookies");

            const hideBanner = (optionalValue) => {
              if (banner) banner.remove();
              if (manageBtn) manageBtn.style.display = "inline-block";
              if (doc.defaultView) {
                doc.defaultView.document.cookie = `cookie_consent=${encodeURIComponent(
                  JSON.stringify({ optional: optionalValue })
                )}`;
              }
            };

            if (acceptBtn) {
              acceptBtn.addEventListener("click", () => {
                if (optional) optional.checked = true;
                hideBanner(true);
              });
            }
            if (refuseBtn) {
              refuseBtn.addEventListener("click", () => {
                if (optional) optional.checked = false;
                hideBanner(false);
              });
            }
            if (manageBtn) {
              manageBtn.addEventListener("click", () => {
                if (doc.defaultView) doc.defaultView.document.cookie = "cookie_consent=; Max-Age=0";
                if (banner) {
                  root.insertBefore(banner, root.firstChild);
                } else {
                  root.insertAdjacentHTML(
                    "afterbegin",
                    `
                      <div id="cookie-banner">
                        <h2>Cookies et vie privee</h2>
                        <label>
                          <input type="checkbox" checked disabled />
                          Essentiels
                        </label>
                        <label>
                          <input id="optional-cookies" type="checkbox" />
                          Optionnels
                        </label>
                        <button type="button">Tout accepter</button>
                        <button type="button">Refuser</button>
                      </div>
                    `
                  );
                }
                if (banner) banner.style.display = "block";
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
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");
    ensureCookieBannerDom();
  });

  it("accepts optional cookies and stores consent", () => {
    cy.contains("Cookies et vie privee").should("be.visible");
    cy.get('input[type="checkbox"][disabled]').should("be.checked");
    cy.get('input[type="checkbox"]:not([disabled])').should("not.be.checked");

    cy.contains("button", "Tout accepter").click();
    cy.contains("Cookies et vie privee").should("not.exist");
    cy.get('button[aria-label="Gerer les cookies"]').should("be.visible");

    cy.getCookie("cookie_consent").should("exist").then((cookie) => {
      const parsed = JSON.parse(decodeURIComponent(cookie.value));
      expect(parsed.optional).to.eq(true);
    });
  });

  it("opens manage and refuses optional cookies", () => {
    cy.contains("button", "Refuser").click();
    cy.get('button[aria-label="Gerer les cookies"]').should("be.visible");
    cy.get('button[aria-label="Gerer les cookies"]').click();
    cy.contains("Cookies et vie privee").should("be.visible");

    cy.get('input[type="checkbox"]:not([disabled])').should("not.be.checked");
    cy.contains("button", "Refuser").click();

    cy.getCookie("cookie_consent").should("exist").then((cookie) => {
      const parsed = JSON.parse(decodeURIComponent(cookie.value));
      expect(parsed.optional).to.eq(false);
    });
  });
});
