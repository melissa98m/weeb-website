import React from "react";
import { MemoryRouter } from "react-router-dom";
import Button from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-6 flex items-center gap-4 bg-white text-gray-900">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    children: "Action",
    className:
      "px-4 py-2 rounded-md bg-primary text-dark hover:brightness-110 shadow",
    onClick: () => {},
  },
};

export default meta;

export const Primary = {};

export const Disabled = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const AsLink = {
  args: {
    to: "/demo",
    children: "Aller au lien",
  },
};

export const Interactive = {
  render: (args) => {
    const [count, setCount] = React.useState(0);
    return (
      <div className="flex items-center gap-4">
        <Button {...args} onClick={() => setCount((c) => c + 1)}>
          {args.children}
        </Button>
        <span className="text-sm text-gray-600">Clics: {count}</span>
      </div>
    );
  },
  args: {
    children: "Clique-moi",
  },
};
