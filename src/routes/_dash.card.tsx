import { createFileRoute } from "@tanstack/react-router";
import { CardEditor } from "@/components/app/CardEditor";

export const Route = createFileRoute("/_dash/card")({
  head: () => ({
    meta: [
      { title: "Birthday Card Generator — DOBverse" },
      {
        name: "description",
        content:
          "Design, save and share a personal birthday card using your locally saved birthdays.",
      },
      { property: "og:title", content: "Birthday Card Generator — DOBverse" },
      {
        property: "og:description",
        content:
          "Design, save and share a personal birthday card using your locally saved birthdays.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardEditor,
});
