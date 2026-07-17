// -----------------------------------------------------------------------------
// Brand configuration — single source of truth for the product name & voice.
//
// The name is centralized here so it's a one-line change. See
// docs/BRAND_AND_MARKETING.md for the research and rationale behind the
// recommendation (and the shortlist of alternates).
//
// Recommended: "Callsheet" — a tangible industry metaphor (the call sheet is the
// document that says who shoots what, where, and when) that maps precisely onto
// the bench + queue mechanic, in the style of category winners that use coined
// or metaphor names (Snappr, Thumbtack, Aryeo) rather than descriptive ones.
// To try an alternate, change NAME below (e.g. "Focal", "Setly", or the original
// "Photographylink").
// -----------------------------------------------------------------------------

export const brand = {
  name: "Callsheet",
  // The wordmark can be split to accent the second half in the logo.
  wordmark: { head: "Call", tail: "sheet" },
  tagline: "The bench that never misses a shoot.",
  domainIdea: "callsheet.co",
  // Dual-accent system (see marketing doc): amber drives photographer/claim
  // energy; blue signals company-side trust. Both are deliberately non-green to
  // separate from commodity gig marketplaces (Fiverr/Upwork green).
  accents: {
    action: "#e8a94b", // golden-hour amber — claim / photographer side
    trust: "#7c9cf5", // slate blue — company / booking side
  },
} as const;
