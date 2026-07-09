import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Lock, Mail, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authService } from "../../services/auth.service";
import { getErrorMessage } from "../../utils/format";

const schema = z
  .object({
    email: z.email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

function Field({
  label,
  error,
  icon: Icon,
  children,
}: Readonly<{
  label: string;
  error?: string;
  icon: React.FC<{ size?: number; className?: string }>;
  children: React.ReactNode;
}>) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ email, password }: FormData) =>
      authService.signUp(email, password),
    onSuccess: () => {
      toast.success("Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate({ to: "/login" }), 1500);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const inputClass = (hasError?: boolean) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors outline-none
    ${
      hasError
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
    }`;

  return (
    <div
      className="min-h-screen flex items-center justify-center
                    bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-700
                            flex items-center justify-center"
            >
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">[APP_NAME]</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Buat Akun</h2>
          <p className="text-slate-500 text-sm mb-7">
            Daftarkan email Anda untuk mulai menggunakan layanan.
          </p>

          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            noValidate
            className="space-y-5"
          >
            <Field label="Email" error={errors.email?.message} icon={Mail}>
              <input
                type="email"
                className={inputClass(!!errors.email)}
                placeholder="nama@email.com"
                autoComplete="email"
                {...register("email")}
              />
            </Field>

            <Field
              label="Password"
              error={errors.password?.message}
              icon={Lock}
            >
              <input
                type="password"
                className={inputClass(!!errors.password)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                {...register("password")}
              />
            </Field>

            <Field
              label="Konfirmasi Password"
              error={errors.confirmPassword?.message}
              icon={Lock}
            >
              <input
                type="password"
                className={inputClass(!!errors.confirmPassword)}
                placeholder="Ulangi password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </Field>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5
                         bg-linear-to-r from-blue-600 to-blue-700 text-white
                         rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30
                         hover:from-blue-500 hover:to-blue-600 transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {mutation.isPending ? "Mendaftar..." : "Daftar"}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
