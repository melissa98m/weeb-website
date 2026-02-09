import React from "react";

const meta = {
  title: "Documentation/Mocks",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Guide = {
  render: () => (
    <div className="prose max-w-2xl">
      <h1>Mocks</h1>
      <p>
        Pour eviter les appels reseau en local, Storybook intercepte fetch et
        renvoie des reponses mockees pour les endpoints utilises par les
        composants.
      </p>

      <h2>Fichier</h2>
      <pre>
        <code>src/stories/storybook-mocks.js</code>
      </pre>

      <h2>Endpoints mockes</h2>
      <ul>
        <li>GET /subjects/</li>
        <li>GET /articles/</li>
        <li>POST /messages/</li>
        <li>POST /newsletter-consents/</li>
        <li>POST /feedbacks/</li>
        <li>GET /auth/csrf/, GET /csrf/</li>
        <li>GET /auth/me/</li>
        <li>POST /auth/login/</li>
        <li>POST /auth/logout/</li>
      </ul>

      <h2>Desactiver les mocks</h2>
      <p>
        Commente l'appel installStorybookMocks() dans
        .storybook/preview.js.
      </p>
    </div>
  ),
};
