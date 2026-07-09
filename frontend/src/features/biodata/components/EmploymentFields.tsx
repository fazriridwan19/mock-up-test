import { useFieldArray } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Briefcase } from "lucide-react";
import type { BiodataFormValues } from "../BiodataForm";

interface Props {
  control: Control<BiodataFormValues>;
  errors: FieldErrors<BiodataFormValues>;
}

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2 text-sm rounded-xl border transition-colors outline-none
   ${
     err
       ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
       : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
   }`;

export function EmploymentFields({ control, errors }: Readonly<Props>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "employmentHistories",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {fields.length} entri
        </p>
        <button
          type="button"
          onClick={() =>
            append({
              company: "",
              position: "",
              startDate: "",
              endDate: "",
              salary: undefined,
              description: "",
            })
          }
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold
                     hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          <PlusCircle size={14} />
          Tambah
        </button>
      </div>

      {fields.length === 0 && (
        <div
          className="flex flex-col items-center py-8 text-slate-400 border-2 border-dashed
                        border-slate-200 rounded-xl bg-slate-50"
        >
          <Briefcase size={28} className="mb-2 text-slate-300" />
          <p className="text-sm">Belum ada riwayat pekerjaan.</p>
          <p className="text-xs mt-0.5">
            Klik &ldquo;Tambah&rdquo; untuk menambahkan.
          </p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {fields.map((field, idx) => {
          const e = errors.employmentHistories?.[idx];
          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Pekerjaan #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nama Perusahaan <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputCls(!!e?.company)}
                      placeholder="PT. Contoh Perusahaan"
                      {...control.register(
                        `employmentHistories.${idx}.company`,
                      )}
                    />
                    {e?.company && (
                      <p className="mt-1 text-xs text-red-500">
                        {e.company.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Jabatan / Posisi <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputCls(!!e?.position)}
                      placeholder="Software Engineer"
                      {...control.register(
                        `employmentHistories.${idx}.position`,
                      )}
                    />
                    {e?.position && (
                      <p className="mt-1 text-xs text-red-500">
                        {e.position.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tanggal Mulai <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      className={inputCls(!!e?.startDate)}
                      {...control.register(
                        `employmentHistories.${idx}.startDate`,
                      )}
                    />
                    {e?.startDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {e.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tanggal Selesai
                      <span className="text-slate-400 font-normal ml-1">
                        (kosongkan jika masih aktif)
                      </span>
                    </label>
                    <input
                      type="date"
                      className={inputCls()}
                      {...control.register(
                        `employmentHistories.${idx}.endDate`,
                        {
                          setValueAs: (v) =>
                            v === '' || v == null ? undefined : v,
                        },
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Gaji (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      className={inputCls()}
                      placeholder="8000000"
                      {...control.register(
                        `employmentHistories.${idx}.salary`,
                        {
                          setValueAs: (v) =>
                            v === "" || v == null ? undefined : Number(v),
                        },
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Deskripsi Pekerjaan
                    </label>
                    <textarea
                      rows={2}
                      className={inputCls()}
                      placeholder="Tanggung jawab dan pencapaian..."
                      {...control.register(
                        `employmentHistories.${idx}.description`,
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
