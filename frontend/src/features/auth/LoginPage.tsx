import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Building2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/format";

const schema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormData) => authService.login(values),
    onSuccess: ({ user }) => {
      setUser(user);
      toast.success("Selamat datang kembali!");
      navigate({ to: user.role === "ADMIN" ? "/admin" : "/biodata" });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center"
        >
          <div
            className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-400 to-blue-600
                          flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30"
          >
            <Building2 size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">[APP_NAME]</h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Platform manajemen biodata karyawan yang modern, cepat, dan aman.
          </p>
          {/* Decorative orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full
                          bg-blue-600/20 blur-3xl pointer-events-none"
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full
                          bg-indigo-600/20 blur-3xl pointer-events-none"
          />
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-7">
              <div
                className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-700
                              flex items-center justify-center"
              >
                <Building2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                [APP_NAME]
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">Masuk</h2>
            <p className="text-slate-500 text-sm mb-7">
              Masukkan kredensial akun Anda untuk melanjutkan.
            </p>

            <form
              onSubmit={handleSubmit((v) => mutation.mutate(v))}
              noValidate
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm
                                transition-colors outline-none
                                ${
                                  errors.email
                                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                    : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                                }`}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm
                                transition-colors outline-none
                                ${
                                  errors.password
                                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                    : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"
                                }`}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={mutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                           bg-linear-to-r from-blue-600 to-blue-700 text-white
                           rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30
                           hover:from-blue-500 hover:to-blue-600 transition-all
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                {mutation.isPending ? "Masuk..." : "Masuk"}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-semibold hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
