import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { mailtoLink, whatsappConfigured, whatsappLink } from "@/lib/whatsapp";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.union([z.string().trim().email("Enter a valid email address"), z.literal("")]),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number we can reach you on")
    // Digits, spaces and the usual separators; the count is what matters.
    .refine((value) => (value.match(/\d/g) ?? []).length >= 7, "Enter a valid phone number"),
  rollNumber: z.string().trim().max(20, "That does not look like a roll number"),
  topic: z.string().min(1, "Choose what this is about"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more so we can answer properly")
    .max(800, "Keep this under 800 characters"),
});

type Enquiry = z.infer<typeof schema>;

interface EnquiryFormProps {
  /** Where the enquiry goes when the visitor sends it by email. */
  email: string;
  /** What this is about — the list the visitor picks from. */
  topics: string[];
  /** Pre-selects one of `topics`, for a form sitting under a specific answer. */
  defaultTopic?: string;
  /** Subject line on the email draft. */
  subject?: string;
  /** Asks for a roll number — worth it on pages current students use. */
  askRollNumber?: boolean;
}

/**
 * The public "ask us something" form.
 *
 * There is no enquiries endpoint on the Django API — it serves the portal,
 * behind authentication — so nothing is POSTed here. The form composes the
 * message and hands it to WhatsApp or to the visitor's mail client, and says
 * plainly that it is not sent until they press send there.
 */
export function EnquiryForm({
  email,
  topics,
  defaultTopic,
  subject = "Enquiry from the Nyenneh University website",
  askRollNumber = false,
}: EnquiryFormProps) {
  // Kept after submitting so the confirmation can offer the link again — the
  // browser blocks the popup if the tab has lost the user gesture.
  const [sent, setSent] = useState<{ whatsapp: string; mail: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Enquiry>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      rollNumber: "",
      topic: defaultTopic ?? "",
      message: "",
    },
  });

  const compose = (values: Enquiry) => [
    "Hello Nyenneh University, I have an enquiry.",
    "",
    `Name: ${values.fullName}`,
    `Phone: ${values.phone}`,
    values.email ? `Email: ${values.email}` : null,
    values.rollNumber ? `Roll number: ${values.rollNumber}` : null,
    `About: ${values.topic}`,
    "",
    values.message,
  ];

  const onSubmit = handleSubmit((values) => {
    const lines = compose(values);
    const links = {
      whatsapp: whatsappConfigured ? whatsappLink(lines) : "",
      mail: mailtoLink(email, subject, lines),
    };
    setSent(links);

    // WhatsApp when the build has a number; otherwise straight to the mail
    // client, so the form still does something useful either way.
    if (links.whatsapp) {
      window.open(links.whatsapp, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(links.mail);
    }
  });

  if (sent) {
    return (
      <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-sm shadow-ink-950/[0.03]">
        <span className="grid size-11 place-items-center rounded-xl bg-green-50 text-green-700">
          <CheckCircle2 className="size-5" />
        </span>

        <h3 className="mt-5 text-lg font-semibold text-ink-900">
          {sent.whatsapp ? "Ready to send on WhatsApp" : "Ready to send by email"}
        </h3>
        <p className="mt-2 text-sm/6 text-ink-600">
          Your enquiry is typed out and waiting in{" "}
          {sent.whatsapp ? "the chat that opened" : "your mail app"}. It only reaches
          the university once you press send there.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {sent.whatsapp ? (
            <a
              href={sent.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-700 transition hover:text-brand-600"
            >
              Nothing opened? Open the chat again
            </a>
          ) : null}
          <a
            href={sent.mail}
            className="text-sm font-semibold text-brand-700 transition hover:text-brand-600"
          >
            Send it by email instead
          </a>
        </div>

        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(null);
            reset({ topic: defaultTopic ?? "" });
          }}
        >
          Ask something else
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm shadow-ink-950/[0.03] sm:p-8"
    >
      <h3 className="text-lg font-semibold text-ink-900">Ask us directly</h3>
      <p className="mt-1.5 text-sm/6 text-ink-600">
        If the answer you need is not here, send the question and the right office
        will come back to you on a working day.
      </p>

      <div className="mt-6 space-y-4">
        <Input
          label="Full name"
          placeholder="Tom Nyenneh"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone number"
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

        {askRollNumber ? (
          <Input
            label="Roll number"
            placeholder="NU/CSC/2024/018"
            hint="Optional — only if you are already a student here"
            error={errors.rollNumber?.message}
            {...register("rollNumber")}
          />
        ) : null}

        <Select label="What is this about?" error={errors.topic?.message} {...register("topic")}>
          <option value="" disabled>
            Choose a subject
          </option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>

        <Textarea
          label="Your question"
          rows={5}
          placeholder="Tell us what you need to know."
          error={errors.message?.message}
          {...register("message")}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          icon={
            whatsappConfigured ? (
              <MessageCircle className="size-4" />
            ) : (
              <Mail className="size-4" />
            )
          }
        >
          {whatsappConfigured ? "Send on WhatsApp" : "Send by email"}
        </Button>
        <p className="text-xs/5 text-ink-500">
          Nothing is submitted from this page — the button hands the message to{" "}
          {whatsappConfigured ? "WhatsApp" : "your mail app"}, and you press send.
        </p>
      </div>
    </form>
  );
}
