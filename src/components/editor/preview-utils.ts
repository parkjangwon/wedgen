export type PreviewDevice = "iphone" | "plus" | "android";
export type PreviewBackdrop = "studio" | "paper" | "dark";

export const previewDeviceMeta: Record<
  PreviewDevice,
  { label: string; viewport: string; width: number; height: number }
> = {
  iphone: { label: "iPhone", viewport: "390 × 844", width: 390, height: 844 },
  plus: { label: "Large", viewport: "430 × 932", width: 430, height: 932 },
  android: { label: "Android", viewport: "412 × 915", width: 412, height: 915 },
};

export const previewBackdropMeta: Record<
  PreviewBackdrop,
  { label: string; className: string }
> = {
  studio: {
    label: "Studio",
    className: "bg-[radial-gradient(circle_at_top,#2a2422_0%,#131112_58%,#0f0f10_100%)]",
  },
  paper: {
    label: "Paper",
    className: "bg-[linear-gradient(180deg,#f3ede6_0%,#ebe2d6_100%)]",
  },
  dark: {
    label: "Dark",
    className: "bg-[linear-gradient(180deg,#0e1117_0%,#151a23_100%)]",
  },
};

export function withPreviewBridge(html: string) {
  const bridge = `<script>
window.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "wedgen-preview") return;
  if (event.data.action === "scrollToSection" && event.data.section) {
    const target = document.querySelector('[data-section="' + event.data.section + '"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
</script>`;

  return html.includes("</body>")
    ? html.replace("</body>", `${bridge}</body>`)
    : `${html}${bridge}`;
}
