/**
 * Click-to-chat and mailto links for the public enquiry forms.
 *
 * The public site has no backend of its own — the Django API only serves the
 * portal, behind authentication — so an enquiry from a visitor leaves the
 * browser through the visitor's own WhatsApp or mail client rather than a
 * POST. That keeps the forms honest: nothing pretends to have been filed.
 */

/**
 * The registry's WhatsApp line, digits only with the country code and no "+"
 * — that is the shape wa.me expects. Set VITE_WHATSAPP_NUMBER before building.
 */
export const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
  /\D/g,
  "",
);

/** False when the build has no number configured, so callers can offer email instead. */
export const whatsappConfigured = whatsappNumber.length > 0;

/** Joins the lines into one message, dropping the ones a caller left out. */
function compose(lines: (string | null | undefined)[]) {
  return lines.filter((line) => line !== null && line !== undefined).join("\n");
}

/** Opens WhatsApp with the enquiry already typed out; the visitor presses send. */
export function whatsappLink(lines: (string | null | undefined)[]) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(compose(lines))}`;
}

/** The same message as a draft email, for visitors who do not use WhatsApp. */
export function mailtoLink(
  to: string,
  subject: string,
  lines: (string | null | undefined)[],
) {
  const query = new URLSearchParams({ subject, body: compose(lines) });
  // URLSearchParams encodes spaces as "+", which mail clients render literally.
  return `mailto:${to}?${query.toString().replace(/\+/g, "%20")}`;
}
