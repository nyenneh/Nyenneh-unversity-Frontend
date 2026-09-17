import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router-dom";
import { z } from "zod";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useLogin } from "@/hooks/useAuth";
import { homePathForRole } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email: z.string().min(1, "Enter your email address").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // where the guard bounced them from, so we can send them back after login
  const from = (location.state as { from?: string } | null)?.from;
  const login = useLogin(from);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (isAuthenticated() && user) {
    return (
      <Navigate
        to={user.must_change_password ? "/change-password" : homePathForRole(user.role)}
        replace
      />
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* decorative, so it goes away on small screens */}
      <div className="relative hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,rgba(210,154,21,0.35),transparent)]"
        />
        <div className="relative flex items-center gap-3 text-white">
          <Logo className="size-10" />
          <span className="text-lg font-semibold">Nyenneh University</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            One portal for registration, results and fees.
          </h2>
          <p className="mt-4 text-navy-200">
            Register for courses, track your class schedule, check published results and settle
            your tuition — all from the same place.
          </p>
        </div>

        <p className="relative text-sm text-navy-300">
          &copy; {new Date().getFullYear()} Nyenneh University. All rights reserved.
        </p>
      </div>

      {/* the actual form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo className="size-10" />
            <span className="text-lg font-semibold text-ink-900">Nyenneh University</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">
            Use the credentials issued by the registry office.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit((values) => login.mutate(values))}
            noValidate
          >
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-[2.35rem] size-4 text-ink-400" />
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@nyenneh.edu"
                className="pl-9"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-[2.35rem] size-4 text-ink-400" />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-500">
            First time signing in? Use the temporary password emailed to you; the
            portal will ask you to choose your own.
          </p>
        </div>
      </div>
    </div>
  );
}
