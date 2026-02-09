import React from "react";

const meta = {
  title: "Documentation/Storybook",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Guide = {
  render: () => (
    <div className="prose max-w-2xl">
      <h1>Storybook</h1>
      <p>
        Storybook sert a visualiser et tester les composants en isolation. Les
        stories utilisent les providers Theme/Language/Auth pour reproduire
        l'app.
      </p>

      <h2>Lancer Storybook</h2>
      <pre>
        <code>npm run storybook</code>
      </pre>

      <h2>Build statique</h2>
      <pre>
        <code>npm run build-storybook</code>
      </pre>

      <h2>Notes utiles</h2>
      <ul>
        <li>Les assets publics sont servis via public/ (ex: /weeb.svg).</li>
        <li>Les styles globaux sont injectes par .storybook/preview.js.</li>
        <li>Les docs auto sont activees via autodocs.</li>
      </ul>
    </div>
  ),
};
