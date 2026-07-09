import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Briefcase,
  User,
  Phone,
  Sparkles,
  GraduationCap,
  Award,
  Building2,
} from "lucide-react";
import {
  genderLabels,
  religionLabels,
  maritalStatusLabels,
  formatRupiah,
} from "../../utils/format";
import { EducationFields } from "./components/EducationFields";
import { TrainingFields } from "./components/TrainingFields";
import { EmploymentFields } from "./components/EmploymentFields";

// ─── Schema ───────────────────────────────────────────────────────────────────

const educationSchema = z.object({
  institution: z.string().min(2, "Nama institusi minimal 2 karakter"),
  major: z.string().min(2, "Jurusan minimal 2 karakter"),
  degree: z.enum([
    "SD",
    "SMP",
    "SMA",
    "SMK",
    "D1",
    "D2",
    "D3",
    "D4",
    "S1",
    "S2",
    "S3",
  ]),
  startYear: z.number().int().min(1950).max(2100),
  endYear: z.number().int().min(1950).max(2100).optional().nullable(),
  gpa: z.number().min(0).max(4).optional().nullable(),
});

const trainingSchema = z.object({
  name: z.string().min(2, "Nama pelatihan minimal 2 karakter"),
  organizer: z.string().min(2, "Penyelenggara minimal 2 karakter"),
  year: z.number().int().min(1950).max(2100),
  duration: z.string().optional(),
  certificate: z.string().optional(),
});

const employmentSchema = z.object({
  company: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  position: z.string().min(2, "Jabatan minimal 2 karakter"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().optional(),
  salary: z.number().min(0).optional().nullable(),
  description: z.string().optional(),
});

export const biodataSchema = z.object({
  appliedPosition: z.string().min(2, "Posisi yang dilamar wajib diisi"),
  fullName: z.string().min(2, "Nama lengkap wajib diisi"),
  nationalIdNumber: z.string().length(16, "NIK harus tepat 16 digit"),
  birthPlace: z.string().min(2, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["MALE", "FEMALE"]),
  religion: z.enum([
    "ISLAM",
    "CHRISTIAN",
    "CATHOLIC",
    "HINDU",
    "BUDDHA",
    "KONGHUCU",
  ]),
  bloodType: z.enum(["A", "B", "AB", "O"]).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
  ktpAddress: z.string().min(10, "Alamat KTP minimal 10 karakter"),
  currentAddress: z.string().min(10, "Alamat domisili minimal 10 karakter"),
  email: z.string().email("Email tidak valid"),
  phoneNumber: z.string().min(9, "Nomor HP tidak valid").max(15),
  emergencyContact: z.string().min(9, "Kontak darurat tidak valid").max(15),
  skills: z.string().optional(),
  willingToBePlaced: z.boolean().optional(),
  expectedSalary: z.number().min(0).optional(),
  educationHistories: z.array(educationSchema).optional(),
  trainingHistories: z.array(trainingSchema).optional(),
  employmentHistories: z.array(employmentSchema).optional(),
});

export type BiodataFormValues = z.infer<typeof biodataSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2 text-sm rounded-xl border transition-colors outline-none
   ${
     err
       ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
       : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
   }`;

function FormSection({
  icon,
  title,
  children,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-xs text-red-500">{message}</p>
  ) : null;
}

export const BIODATA_FORM_ID = "biodata-form";

// ─── Props & Component ────────────────────────────────────────────────────────

interface Props {
  defaultValues?: Partial<BiodataFormValues>;
  onSubmit: (data: BiodataFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BiodataForm({ defaultValues, onSubmit }: Readonly<Props>) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema),
    defaultValues: {
      willingToBePlaced: false,
      expectedSalary: 0,
      educationHistories: [],
      trainingHistories: [],
      employmentHistories: [],
      ...defaultValues,
    },
  });

  const expectedSalary = watch("expectedSalary");

  return (
    <form id={BIODATA_FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Lamaran */}
      <FormSection icon={<Briefcase size={15} />} title="Data Lamaran">
        <div>
          <Label required>Posisi yang Dilamar</Label>
          <input
            type="text"
            className={inputCls(!!errors.appliedPosition)}
            placeholder="Contoh: Backend Developer"
            {...register("appliedPosition")}
          />
          <FieldError message={errors.appliedPosition?.message} />
        </div>
      </FormSection>

      {/* Pribadi */}
      <FormSection icon={<User size={15} />} title="Data Pribadi">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Nama Lengkap</Label>
            <input
              type="text"
              className={inputCls(!!errors.fullName)}
              placeholder="Sesuai KTP"
              {...register("fullName")}
            />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div>
            <Label required>Nomor KTP (NIK)</Label>
            <input
              type="text"
              maxLength={16}
              className={inputCls(!!errors.nationalIdNumber)}
              placeholder="16 digit NIK"
              {...register("nationalIdNumber")}
            />
            <FieldError message={errors.nationalIdNumber?.message} />
          </div>
          <div>
            <Label required>Tempat Lahir</Label>
            <input
              type="text"
              className={inputCls(!!errors.birthPlace)}
              placeholder="Jakarta"
              {...register("birthPlace")}
            />
            <FieldError message={errors.birthPlace?.message} />
          </div>
          <div>
            <Label required>Tanggal Lahir</Label>
            <input
              type="date"
              className={inputCls(!!errors.birthDate)}
              {...register("birthDate")}
            />
            <FieldError message={errors.birthDate?.message} />
          </div>
          <div>
            <Label required>Jenis Kelamin</Label>
            <select
              className={inputCls(!!errors.gender)}
              {...register("gender")}
            >
              <option value="">— Pilih —</option>
              {Object.entries(genderLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <FieldError message={errors.gender?.message} />
          </div>
          <div>
            <Label required>Agama</Label>
            <select
              className={inputCls(!!errors.religion)}
              {...register("religion")}
            >
              <option value="">— Pilih —</option>
              {Object.entries(religionLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <FieldError message={errors.religion?.message} />
          </div>
          <div>
            <Label>Golongan Darah</Label>
            <select className={inputCls()} {...register("bloodType")}>
              <option value="">— Tidak Tahu —</option>
              {["A", "B", "AB", "O"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label required>Status Perkawinan</Label>
            <select
              className={inputCls(!!errors.maritalStatus)}
              {...register("maritalStatus")}
            >
              <option value="">— Pilih —</option>
              {Object.entries(maritalStatusLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <FieldError message={errors.maritalStatus?.message} />
          </div>
          <div>
            <Label required>Alamat Sesuai KTP</Label>
            <textarea
              rows={3}
              className={inputCls(!!errors.ktpAddress)}
              placeholder="Alamat lengkap sesuai KTP"
              {...register("ktpAddress")}
            />
            <FieldError message={errors.ktpAddress?.message} />
          </div>
          <div>
            <Label required>Alamat Domisili Sekarang</Label>
            <textarea
              rows={3}
              className={inputCls(!!errors.currentAddress)}
              placeholder="Alamat tempat tinggal saat ini"
              {...register("currentAddress")}
            />
            <FieldError message={errors.currentAddress?.message} />
          </div>
        </div>
      </FormSection>

      {/* Kontak */}
      <FormSection icon={<Phone size={15} />} title="Informasi Kontak">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>Email</Label>
            <input
              type="email"
              className={inputCls(!!errors.email)}
              placeholder="email@contoh.com"
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label required>Nomor HP / WhatsApp</Label>
            <input
              type="tel"
              className={inputCls(!!errors.phoneNumber)}
              placeholder="08xxxxxxxxxx"
              {...register("phoneNumber")}
            />
            <FieldError message={errors.phoneNumber?.message} />
          </div>
          <div>
            <Label required>Kontak Darurat</Label>
            <input
              type="tel"
              className={inputCls(!!errors.emergencyContact)}
              placeholder="08xxxxxxxxxx"
              {...register("emergencyContact")}
            />
            <FieldError message={errors.emergencyContact?.message} />
          </div>
        </div>
      </FormSection>

      {/* Keahlian */}
      <FormSection
        icon={<Sparkles size={15} />}
        title="Keahlian & Preferensi Kerja"
      >
        <div className="space-y-4">
          <div>
            <Label>Keahlian</Label>
            <textarea
              rows={2}
              className={inputCls()}
              placeholder="React, Node.js, TypeScript, MySQL..."
              {...register("skills")}
            />
            <p className="mt-1 text-xs text-slate-400">Pisahkan dengan koma</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Gaji yang Diharapkan (Rp)</Label>
              <input
                type="number"
                min="0"
                step="500000"
                className={inputCls(!!errors.expectedSalary)}
                placeholder="8000000"
                {...register("expectedSalary", {
                  setValueAs: (v) => {
                    const n = parseFloat(v);
                    return isNaN(n) ? 0 : n;
                  },
                })}
              />
              {expectedSalary ? (
                <p className="mt-1 text-xs font-semibold text-emerald-600">
                  {formatRupiah(expectedSalary)}
                </p>
              ) : null}
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    id="willingToBePlaced"
                    type="checkbox"
                    className="peer sr-only"
                    {...register("willingToBePlaced", {
                      setValueAs: (v) =>
                        v === true || v === 1 || v === "on" || v === "true",
                    })}
                  />
                  <div
                    className="w-10 h-6 bg-slate-200 rounded-full transition-colors
                                  peer-checked:bg-blue-600 peer-focus-visible:ring-2
                                  peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2"
                  />
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                                  transition-transform peer-checked:translate-x-4"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Bersedia ditempatkan di mana saja
                </span>
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Pendidikan */}
      <FormSection
        icon={<GraduationCap size={15} />}
        title="Riwayat Pendidikan"
      >
        <EducationFields control={control} errors={errors} />
      </FormSection>

      {/* Pelatihan */}
      <FormSection icon={<Award size={15} />} title="Pelatihan & Sertifikasi">
        <TrainingFields control={control} errors={errors} />
      </FormSection>

      {/* Pekerjaan */}
      <FormSection icon={<Building2 size={15} />} title="Pengalaman Kerja">
        <EmploymentFields control={control} errors={errors} />
      </FormSection>
    </form>
  );
}
