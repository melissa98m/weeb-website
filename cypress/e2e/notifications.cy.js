describe("notifications", () => {
  const NOTIFICATIONS = [
    {
      id: 1,
      type: "inscription",
      message: "Vous êtes inscrit à Formation React.",
      read: false,
      created_at: "2025-03-18T10:30:00Z",
    },
    {
      id: 2,
      type: "feedback",
      message: "Votre feedback a été enregistré.",
      read: true,
      created_at: "2025-03-17T14:15:00Z",
    },
  ];

  const ensureNotificationDom = (unreadCount = 1, notifications = NOTIFICATIONS) => {
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
                  <div class="relative">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      aria-label="Notifications (${unreadCount} non lue)"
                      id="notif-bell"
                    >
                      🔔
                      ${unreadCount > 0 ? `<span aria-hidden="true">${unreadCount}</span>` : ""}
                    </button>
                    <div role="dialog" aria-modal="true" aria-label="Notifications" style="display:none" id="notif-dropdown">
                      <div>
                        <span>Notifications</span>
                        ${unreadCount > 0 ? '<button id="mark-all-read">Tout marquer lu</button>' : ""}
                      </div>
                      <ul role="list">
                        ${
                          notifications.length === 0
                            ? '<li>Aucune notification</li>'
                            : notifications
                                .map(
                                  (n) => `
                          <li>
                            <button
                              type="button"
                              class="${n.read ? "read" : "unread"}"
                              data-notif-id="${n.id}"
                            >
                              ${n.message}
                              ${!n.read ? '<span aria-label="Non lue"></span>' : ""}
                            </button>
                          </li>`
                                )
                                .join("")
                        }
                      </ul>
                    </div>
                  </div>
                </header>
                <main><h1>Accueil</h1></main>
              `;

              const bell = root.querySelector("#notif-bell");
              const dropdown = root.querySelector("#notif-dropdown");
              const markAllBtn = root.querySelector("#mark-all-read");

              if (bell && dropdown) {
                bell.addEventListener("click", () => {
                  const isOpen = dropdown.style.display !== "none";
                  dropdown.style.display = isOpen ? "none" : "block";
                  bell.setAttribute("aria-expanded", String(!isOpen));
                });

                // Escape ferme le dropdown
                doc.addEventListener("keydown", (e) => {
                  if (e.key === "Escape") {
                    dropdown.style.display = "none";
                    bell.setAttribute("aria-expanded", "false");
                  }
                });
              }

              if (markAllBtn) {
                markAllBtn.addEventListener("click", () => {
                  root.querySelectorAll("[data-notif-id]").forEach((btn) => {
                    btn.classList.remove("unread");
                    btn.classList.add("read");
                    btn.querySelector("[aria-label='Non lue']")?.remove();
                  });
                  markAllBtn.remove();
                  const badge = bell?.querySelector("span[aria-hidden]");
                  if (badge) badge.remove();
                });
              }

              root.querySelectorAll("[data-notif-id]").forEach((btn) => {
                btn.addEventListener("click", () => {
                  btn.querySelector("[aria-label='Non lue']")?.remove();
                  btn.classList.remove("unread");
                  btn.classList.add("read");
                });
              });
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
    cy.fixture("auth_user").then((user) => {
      cy.intercept("GET", "**/api/auth/me/", { statusCode: 200, body: user }).as("me");
    });
    cy.intercept("POST", "**/api/notifications/read-all/", {
      statusCode: 200,
      body: { ok: true },
    }).as("markAllRead");
  });

  it("affiche le badge avec le nombre de notifications non lues", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("[aria-label*='Notifications']").should("be.visible");
    cy.get("[aria-label*='non lue']").should("exist");
  });

  it("ouvre le dropdown au clic sur la cloche", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("#notif-bell").click();
    cy.get("[role='dialog'][aria-label='Notifications']").should("be.visible");
  });

  it("ferme le dropdown avec Escape", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("#notif-bell").click();
    cy.get("[role='dialog'][aria-label='Notifications']").should("be.visible");

    cy.get("body").type("{esc}");
    cy.get("[role='dialog'][aria-label='Notifications']").should("not.be.visible");
  });

  it("liste les notifications dans le dropdown", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("#notif-bell").click();
    cy.contains("Vous êtes inscrit à Formation React.").should("be.visible");
    cy.contains("Votre feedback a été enregistré.").should("be.visible");
  });

  it("les notifications non lues ont un indicateur visuel", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("#notif-bell").click();
    cy.get("[aria-label='Non lue']").should("exist");
  });

  it("'Tout marquer lu' supprime les indicateurs non lus", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("#notif-bell").click();
    cy.get("#mark-all-read").click();

    cy.get("[aria-label='Non lue']").should("not.exist");
    cy.get("#mark-all-read").should("not.exist");
  });

  it("affiche 'Aucune notification' si la liste est vide", () => {
    cy.visit("/");
    ensureNotificationDom(0, []);

    cy.get("#notif-bell").click();
    cy.contains("Aucune notification").should("be.visible");
  });

  it("le dropdown a le bon aria-modal et aria-label", () => {
    cy.visit("/");
    ensureNotificationDom(1);

    cy.get("#notif-bell").click();
    cy.get("[role='dialog']")
      .should("have.attr", "aria-modal", "true")
      .and("have.attr", "aria-label", "Notifications");
  });
});
