import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useMutation } from "@tanstack/react-query";
import { homePathForRole } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

const schema = z
  .object({
    current_password: z.string().min(1, "Enter the password you were emailed"),
    new_password: z.string().min(8, "Use at least 8 characters"),
    confirm_password: z.string().min(1, "Repeat the new password"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ["confirm_password"],
    message: "The two passwords do not match",
  });

type ChangePasswordForm = z.infer<typeof schema>;

// Nobody self-registers here - the registry creates accounts and emails a
// one-time password. The API refuses every other endpoint until that password
// is replaced, so this is the only screen reachable in that state.
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const change = useMutation({
    mutationFn: (values: ChangePasswordForm) =>
      authService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }),
    onSuccess: () => {
      if (user) setUser({ ...user, must_change_password: false });
      toast.success("Password updated. Welcome to the portal.");
      navigate(user ? homePathForRole(user.role) : "/", { replace: true });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not change your password.")),
  });

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.must_change_password) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Logo className="size-10" />
          <span className="text-lg font-semibold text-ink-900">Nyenneh University</span>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <KeyRound className="size-5" />
          </span>

          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">
            Choose a password
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            You are signed in with the temporary password the registry emailed to{" "}
            <span className="font-medium text-ink-700">{user.email}</span>. Replace it to
            reach the rest of the portal.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => change.mutate(values))}
            noValidate
          >
            <Input
              label="Temporary password"
              type="password"
              autoComplete="current-password"
              error={errors.current_password?.message}
              {...register("current_password")}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters, and not too close to your name or email"
              error={errors.new_password?.message}
              {...register("new_password")}
            />
            <Input
              label="Repeat new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
            />

            <Button type="submit" size="lg" className="w-full" loading={change.isPending}>
              Save password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
