// WhatsApp and mailto links for the enquiry forms.
// The public pages have no backend of their own (the Django API is all behind
// auth), so enquiries leave through the visitor's own WhatsApp or mail app.

// digits only with the country code and no "+", that is what wa.me wants
export const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
  /\D/g,
  "",
);

export const whatsappConfigured = whatsappNumber.length > 0;

function compose(lines: (string | null | undefined)[]) {
  return lines.filter((line) => line !== null && line !== undefined).join("\n");
}

export function whatsappLink(lines: (string | null | undefined)[]) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(compose(lines))}`;
}

export function mailtoLink(
  to: string,
  subject: string,
  lines: (string | null | undefined)[],
) {
  const query = new URLSearchParams({ subject, body: compose(lines) });
  // URLSearchParams encodes spaces as "+" and mail clients show that literally
  return `mailto:${to}?${query.toString().replace(/\+/g, "%20")}`;
}
