import { parseLandingContent } from "@higgsfield/app-landing";

const TEMPLATE_PREVIEW = "/assets/landing/template-preview.svg";

// Legacy design-preview fixture, not the ICA public homepage. Keep all links on
// established public routes; the retired /app staff template must stay HTTP 404.
export const landingContent = parseLandingContent({
  hero: {
    eyebrow: "Your focused workspace",
    title: "Turn complex work into a clear, repeatable flow",
    description:
      "Organize the important work, keep progress visible and move from idea to done without losing context.",
    primaryCta: { label: "Explore newsroom", href: "/newsroom" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
  },
  preview: {
    kind: "route",
    title: "Public newsroom preview",
    src: "/newsroom",
    openHref: "/newsroom",
    openLabel: "Explore newsroom",
  },
  steps: {
    title: "Move forward in 3 easy steps",
    description: "A focused workflow that keeps the next action obvious.",
    items: [
      {
        title: "Capture the work",
        description: "Add the items, files or ideas that need your attention.",
        preview: {
          kind: "instruction",
          icon: "layers",
          title: "Open your workspace",
          description: "Add the first item, file or idea",
        },
      },
      {
        title: "Shape the workflow",
        description: "Organize priorities and choose the controls that fit your process.",
        preview: {
          kind: "action",
          label: "Explore newsroom",
        },
      },
      {
        title: "Finish with confidence",
        description: "Track progress, review the result and keep the next step moving.",
        preview: {
          kind: "result",
          media: { kind: "image", src: TEMPLATE_PREVIEW, alt: "Completed workflow" },
        },
      },
    ],
  },
  features: {
    title: "Built for seamless progress",
    description:
      "The essential controls stay visible while secondary complexity stays out of the way.",
    items: [
      {
        icon: "layers",
        title: "Clear structure",
        description: "Keep related work together in a workspace that is easy to scan.",
      },
      {
        icon: "sliders",
        title: "Flexible controls",
        description: "Adapt views and settings to the task without crowding the main surface.",
      },
      {
        icon: "check",
        title: "Visible progress",
        description: "Understand what changed, what is active and what needs attention next.",
      },
    ],
  },
  showcase: {
    title: "See the workspace in action",
    description: "Explore the product's most important flows before opening the full app.",
    items: [
      {
        label: "Overview",
        media: { kind: "image", src: TEMPLATE_PREVIEW, alt: "Workspace overview" },
      },
      {
        label: "Focused workflow",
        media: { kind: "image", src: TEMPLATE_PREVIEW, alt: "Focused workflow view" },
      },
      {
        label: "Progress review",
        media: { kind: "image", src: TEMPLATE_PREVIEW, alt: "Progress review view" },
      },
    ],
  },
  finalCta: {
    title: "Ready to move your work forward?",
    description: "Discover ICA International reporting and research from the public newsroom.",
    action: { label: "Explore newsroom", href: "/newsroom" },
  },
});
