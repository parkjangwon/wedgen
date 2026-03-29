export const COMMON_SECTION_ORDER = [
  "hero",
  "greeting",
  "family",
  "gallery",
  "schedule",
  "location",
  "account",
  "guestbook",
  "ending",
] as const;

export function mergeSectionOrder(sectionOrder: string[]): string[] {
  const normalized = sectionOrder
    .map((section) => {
      if (section === "info") {
        return "location";
      }

      if (section === "rsvp") {
        return "guestbook";
      }

      return section;
    })
    .filter((section) => !["info", "rsvp"].includes(section));

  return [...new Set([...normalized, ...COMMON_SECTION_ORDER])];
}
