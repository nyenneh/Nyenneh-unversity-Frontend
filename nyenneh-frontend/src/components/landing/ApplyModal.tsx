import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { departments } from "@/content/departments";
import { whatsappConfigured, whatsappLink } from "@/lib/whatsapp";

/** Read off the Academics slideshow, so the two can never disagree about
    what the university admits into. */
const programmes = departments.map((department) => department.name);

/** The intake the landing page is advertising. */
const intake = "2026/2027 first semester";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .min(1, "Enter the number you use on WhatsApp")
    // Digits, spaces and the usual separators; the count is what matters.
    .refine((value) => (value.match(/\d/g) ?? []).length >= 7, "Enter a valid phone number"),
  email: z.union([z.string().trim().email("Enter a valid email address"), z.literal("")]),
  programme: z.string().min(1, "Choose a programme"),
  message: z.string().trim().max(500, "Keep this under 500 characters"),
});

type ApplyForm = z.infer<typeof schema>;

/** Builds the click-to-chat link with the enquiry already typed out. */
function buildWhatsappLink(values: ApplyForm) {
  return whatsappLink([
    "Hello Nyenneh University, I would like to apply for admission.",
    "",
    `Name: ${values.fullName}`,
    `Phone: ${values.phone}`,
    values.email ? `Email: ${values.email}` : null,
    `Programme: ${values.programme}`,
    `Intake: ${intake}`,
    values.message ? `` : null,
    values.message ? `Message: ${values.message}` : null,
  ]);
}

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
}

export function ApplyModal({ open, onClose }: ApplyModalProps) {
  // Kept so the confirmation step can offer the link again when the browser
  // blocks the popup — which it will, if the tab lost the user gesture.
  const [sentLink, setSentLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyForm>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", email: "", programme: "", message: "" },
  });

  // Clear on the way out, so reopening starts on a blank form rather than the
  // last applicant's answers. Modal calls onClose for Escape and the backdrop
  // too, so every path through the dialog lands here.
  const handleClose = () => {
    setSentLink(null);
    reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const link = buildWhatsappLink(values);
    setSentLink(link);
    window.open(link, "_blank", "noopener,noreferrer");
  });

  if (!whatsappConfigured) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Apply for admission"
        description="The WhatsApp line is not configured yet."
        footer={
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        }
      >
        <p className="text-sm/6 text-ink-600">
          Set <code className="rounded bg-ink-100 px-1 py-0.5 text-xs">VITE_WHATSAPP_NUMBER</code>{" "}
          to the registry&apos;s number — country code and digits only, for example{" "}
          <code className="rounded bg-ink-100 px-1 py-0.5 text-xs">231770000000</code> — then
          rebuild the site.
        </p>
      </Modal>
    );
  }

  if (sentLink) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Sent to WhatsApp"
        description="Finish by pressing send in the chat that opened."
        footer={
          <Button variant="outline" onClick={handleClose}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm/6 text-ink-600">
            WhatsApp should have opened in a new tab with your details already typed
            out. Your application only reaches the registry once you press send.
          </p>
          <a
            href={sentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
          >
            Nothing opened? Open the chat again
            <ExternalLink className="size-4" />
          </a>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Apply for admission"
      description={`Tell us who you are and we will continue on WhatsApp. Intake: ${intake}.`}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} icon={<MessageCircle className="size-4" />}>
            Continue on WhatsApp
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Full name"
          placeholder="Tom Nyenneh"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="WhatsApp number"
            type="tel"
            placeholder="+231 77 000 0000"
            autoComplete="tel"
            hint="Include your country code"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            hint="Optional"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <Select label="Programme" error={errors.programme?.message} {...register("programme")}>
          <option value="" disabled>
            Choose a programme
          </option>
          {programmes.map((programme) => (
            <option key={programme} value={programme}>
              {programme}
            </option>
          ))}
        </Select>

        <Textarea
          label="Anything else?"
          placeholder="Questions about entry requirements, transfers, fees…"
          hint="Optional"
          error={errors.message?.message}
          {...register("message")}
        />

        <p className="text-xs/5 text-ink-500">
          Pressing continue opens WhatsApp with this message ready to send. Nothing
          is submitted until you send it there.
        </p>
      </form>
    </Modal>
  );
}
