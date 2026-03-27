import React from "react";
import "../src/index.css";
import { installStorybookMocks } from "../src/stories/storybook-mocks";
import { StoryProviders, buildMockAuth } from "../src/stories/StoryProviders";

installStorybookMocks();

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      const theme = context.globals?.theme ?? context.args?.theme ?? "light";
      const language = context.globals?.language ?? context.args?.language ?? "fr";
      return (
        <StoryProviders theme={theme} language={language} auth={buildMockAuth()}>
          <Story />
        </StoryProviders>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
