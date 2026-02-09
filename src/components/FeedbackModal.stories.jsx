import React from "react";
import FeedbackModal from "./FeedbackModal";
import Button from "./Button";

const formation = {
  id: 12,
  name: "React Masterclass",
};

const meta = {
  title: "Components/FeedbackModal",
  component: FeedbackModal,
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
  },
  args: {
    open: true,
    userId: 42,
    formation,
    theme: "light",
    language: "fr",
    onClose: () => {},
    onSuccess: () => {},
  },
};

export default meta;

export const Static = {};

export const Interactive = {
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <div className="min-h-screen p-6 bg-slate-50">
        <Button
          type="button"
          className="px-4 py-2 rounded-md bg-primary text-dark shadow"
          onClick={() => setOpen(true)}
        >
          Laisser un avis
        </Button>
        <FeedbackModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
