// The landing page's two depth levels, as the dashboard uses them (DESIGN.md). Both shadows carry their own hairline,
// so objects need no border, and shared Cards drop their ring.

/** Cards standing off the sheet: the call table, the chart, the numbers table, plans and the minutes card. */
export const floating = "rounded-[16px] bg-card shadow-(--float) ring-0";

/** Objects resting on the sheet: settings groups, lists and the server status. */
export const raised = "rounded-[16px] bg-card shadow-(--raised) ring-0";

/**
 * Small things resting on the sheet or a card: chips, pills, badges, and outline buttons (pass it with
 * variant="outline": the shared Button stays as shadcn ships it, bordered).
 */
export const resting = "border-transparent bg-card shadow-(--raised)";

/** A clear glass panel on the blueprint ink, like the landing's "Hear a live call" button. */
export const glass = "border border-primary-foreground/15 bg-primary-foreground/8";
