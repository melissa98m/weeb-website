import React from "react";
import Pagination from "./Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  decorators: [
    (Story) => (
      <div className="p-6 bg-white text-gray-900">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark"],
    },
  },
  args: {
    page: 3,
    pageCount: 10,
    theme: "light",
    onPageChange: () => {},
  },
};

export default meta;

export const Static = {};

export const Dark = {
  args: {
    theme: "dark",
    page: 6,
  },
};

export const Interactive = {
  render: (args) => {
    const [page, setPage] = React.useState(args.page);
    return (
      <div className="space-y-3">
        <Pagination {...args} page={page} onPageChange={setPage} />
        <div className="text-sm text-gray-600">Page active: {page}</div>
      </div>
    );
  },
  args: {
    page: 2,
    pageCount: 7,
  },
};
