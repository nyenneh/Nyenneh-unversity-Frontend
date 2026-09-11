import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils";

const controlClasses =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 " +
  "placeholder:text-ink-400 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 " +
  "disabled:bg-ink-50 disabled:text-ink-400";

function Wrapper({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, wrapperClassName, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <input
        id={fieldId}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(controlClasses, error && "border-red-400 focus:ring-red-100", className)}
        {...props}
      />
    </Wrapper>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, wrapperClassName, id, children, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <select
        id={fieldId}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(controlClasses, "pr-8", error && "border-red-400", className)}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, wrapperClassName, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        id={fieldId}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(controlClasses, "min-h-24 resize-y", error && "border-red-400", className)}
        {...props}
      />
    </Wrapper>
  );
});
