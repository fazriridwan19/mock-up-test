import { useFieldArray } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import type { BiodataFormValues } from '../BiodataForm';
import { degreeLabels } from '../../../utils/format';

interface Props {
  control: Control<BiodataFormValues>;
  errors: FieldErrors<BiodataFormValues>;
}

const DEGREES = ['SD','SMP','SMA','SMK','D1','D2','D3','D4','S1','S2','S3'] as const;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2 text-sm rounded-xl border transition-colors outline-none
   ${err
     ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
     : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`;

export function EducationFields({ control, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'educationHistories' });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {fields.length} entri
        </p>
        <button
          type="button"
          onClick={() => append({ institution: '', major: '', degree: 'S1', startYear: currentYear - 4, endYear: undefined, gpa: undefined })}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold
                     hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          <PlusCircle size={14} />Tambah
        </button>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center py-8 text-slate-400 border-2 border-dashed
                        border-slate-200 rounded-xl bg-slate-50">
          <GraduationCap size={28} className="mb-2 text-slate-300" />
          <p className="text-sm">Belum ada riwayat pendidikan.</p>
          <p className="text-xs mt-0.5">Klik &ldquo;Tambah&rdquo; untuk menambahkan.</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {fields.map((field, idx) => {
          const e = errors.educationHistories?.[idx];
          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Pendidikan #{idx + 1}
                  </span>
                  <button type="button" onClick={() => remove(idx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nama Institusi <span className="text-red-400">*</span>
                    </label>
                    <input type="text" className={inputCls(!!e?.institution)}
                      placeholder="Universitas Indonesia"
                      {...control.register(`educationHistories.${idx}.institution`)} />
                    {e?.institution && <p className="mt-1 text-xs text-red-500">{e.institution.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Jurusan <span className="text-red-400">*</span>
                    </label>
                    <input type="text" className={inputCls(!!e?.major)}
                      placeholder="Teknik Informatika"
                      {...control.register(`educationHistories.${idx}.major`)} />
                    {e?.major && <p className="mt-1 text-xs text-red-500">{e.major.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Jenjang <span className="text-red-400">*</span>
                    </label>
                    <select className={inputCls(!!e?.degree)}
                      {...control.register(`educationHistories.${idx}.degree`)}>
                      {DEGREES.map((d) => <option key={d} value={d}>{degreeLabels[d]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Tahun Masuk <span className="text-red-400">*</span>
                    </label>
                    <select className={inputCls(!!e?.startYear)}
                      {...control.register(`educationHistories.${idx}.startYear`, {
                        setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                      })}>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tahun Lulus</label>
                    <select className={inputCls()}
                      {...control.register(`educationHistories.${idx}.endYear`, {
                        setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                      })}>
                      <option value="">Belum lulus</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">IPK</label>
                    <input type="number" step="0.01" min="0" max="4"
                      className={inputCls()} placeholder="3.75"
                      {...control.register(`educationHistories.${idx}.gpa`, {
                        setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                      })} />
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
