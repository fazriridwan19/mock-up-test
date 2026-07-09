import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUser, Pencil, ArrowLeft, PlusCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { biodataService } from '../../services/biodata.service';
import { BiodataForm, BIODATA_FORM_ID, type BiodataFormValues } from './BiodataForm';
import { BiodataView } from './BiodataView';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { JobProgressBanner } from '../../components/JobProgressBanner';
import { Button } from '../../components/Button';
import { getErrorMessage, toInputDate } from '../../utils/format';
import { useJobPoller } from '../../hooks/useJobPoller';
import type { Biodata } from '../../types';

export function BiodataPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobLabel, setJobLabel] = useState('');

  // ── Query ─────────────────────────────────────────────────────────────────

  const { data: biodata, isLoading } = useQuery<Biodata>({
    queryKey: ['biodata', 'me'],
    queryFn: biodataService.getMyBiodata,
    retry: (failureCount, error: unknown) => {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  // ── Job polling ───────────────────────────────────────────────────────────

  const onJobCompleted = useCallback(() => {
    setActiveJobId(null);
    setJobLabel('');
    queryClient.invalidateQueries({ queryKey: ['biodata', 'me'] });
    setMode('view');
    toast.success('Biodata berhasil disimpan!');
  }, [queryClient]);

  const onJobFailed = useCallback((error: string) => {
    setActiveJobId(null);
    setJobLabel('');
    toast.error(`Operasi gagal: ${error}`);
  }, []);

  useJobPoller({
    jobId: activeJobId,
    basePath: '/biodata/jobs',
    onCompleted: onJobCompleted,
    onFailed: onJobFailed,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: biodataService.createBiodata,
    onSuccess: ({ jobId }) => { setJobLabel('Membuat biodata...'); setActiveJobId(jobId); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: biodataService.updateBiodata,
    onSuccess: ({ jobId }) => { setJobLabel('Menyimpan perubahan...'); setActiveJobId(jobId); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = (values: BiodataFormValues) => {
    const payload = { ...values, bloodType: values.bloodType || undefined };
    if (biodata) {
      updateMutation.mutate(payload as Parameters<typeof biodataService.updateBiodata>[0]);
    } else {
      createMutation.mutate(payload as Parameters<typeof biodataService.createBiodata>[0]);
    }
  };

  const buildDefaultValues = (b: Biodata): Partial<BiodataFormValues> => ({
    appliedPosition: b.appliedPosition,
    fullName: b.fullName,
    nationalIdNumber: b.nationalIdNumber,
    birthPlace: b.birthPlace,
    birthDate: toInputDate(b.birthDate),
    gender: b.gender,
    religion: b.religion,
    bloodType: b.bloodType,
    maritalStatus: b.maritalStatus,
    ktpAddress: b.ktpAddress,
    currentAddress: b.currentAddress,
    email: b.email,
    phoneNumber: b.phoneNumber,
    emergencyContact: b.emergencyContact,
    skills: b.skills,
    willingToBePlaced: Boolean(b.willingToBePlaced),
    expectedSalary: Number(b.expectedSalary),
    educationHistories: b.educationHistories?.map((e) => ({
      institution: e.institution, major: e.major, degree: e.degree,
      startYear: e.startYear, endYear: e.endYear ?? undefined, gpa: e.gpa ?? undefined,
    })),
    trainingHistories: b.trainingHistories?.map((t) => ({
      name: t.name, organizer: t.organizer, year: t.year,
      duration: t.duration ?? '', certificate: t.certificate ?? '',
    })),
    employmentHistories: b.employmentHistories?.map((e) => ({
      company: e.company, position: e.position,
      startDate: toInputDate(e.startDate),
      endDate: e.endDate ? toInputDate(e.endDate) : '',
      salary: e.salary ? Number(e.salary) : undefined,
      description: e.description ?? '',
    })),
  });

  const isBusy = createMutation.isPending || updateMutation.isPending || !!activeJobId;
  const isFormMode = mode === 'create' || mode === 'edit';
  const submitLabel = !!activeJobId ? 'Memproses...' : biodata ? 'Perbarui Biodata' : 'Simpan Biodata';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Sticky action bar — fixed top, offset by sidebar width (256px = left-64) ── */}
      <div className="fixed top-0 left-64 right-0 z-20
                      bg-white/90 backdrop-blur-md border-b border-slate-200
                      shadow-sm shadow-slate-900/5">
        <div className="max-w-3xl mx-auto px-8 h-14 flex items-center justify-between gap-3">
          {/* Left — page identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700
                            flex items-center justify-center flex-shrink-0">
              <FileUser size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                Biodata Saya
              </p>
              {isFormMode && (
                <p className="text-xs text-slate-400 leading-tight">
                  {mode === 'edit' ? 'Mode edit' : 'Biodata baru'}
                </p>
              )}
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View mode — show Edit button */}
            {biodata && mode === 'view' && (
              <Button
                icon={<Pencil size={14} />}
                onClick={() => setMode('edit')}
                disabled={isBusy}
              >
                Edit Biodata
              </Button>
            )}

            {/* Form mode — show Back + Submit */}
            {isFormMode && (
              <>
                <Button
                  variant="secondary"
                  icon={<ArrowLeft size={14} />}
                  onClick={() => setMode('view')}
                  disabled={isBusy}
                >
                  Kembali
                </Button>
                {/* form= attribute links button to the form by id — works outside <form> */}
                <button
                  type="submit"
                  form={BIODATA_FORM_ID}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
                             bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl
                             shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-blue-600
                             transition-all active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBusy ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent
                                     rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {submitLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Page content — padded top to clear sticky bar (h-14 = 56px) ── */}
      <div className="pt-14 max-w-3xl mx-auto space-y-6">

        {/* Job progress */}
        <AnimatePresence>
          {!!activeJobId && <JobProgressBanner label={jobLabel} jobId={activeJobId} />}
        </AnimatePresence>

        {isLoading && <LoadingSpinner fullscreen text="Memuat biodata..." />}

        <AnimatePresence mode="wait">
          {/* Empty state */}
          {!isLoading && !biodata && mode === 'view' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center
                              mx-auto mb-5">
                <FileUser size={28} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Biodata Belum Tersedia</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                Anda belum mengisi biodata. Lengkapi data Anda untuk melanjutkan proses lamaran.
              </p>
              <Button
                icon={<PlusCircle size={15} />}
                onClick={() => setMode('create')}
                disabled={isBusy}
              >
                Buat Biodata Sekarang
              </Button>
            </motion.div>
          )}

          {/* View biodata */}
          {!isLoading && biodata && mode === 'view' && (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BiodataView biodata={biodata} />
            </motion.div>
          )}

          {/* Create / edit form */}
          {isFormMode && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <BiodataForm
                defaultValues={biodata ? buildDefaultValues(biodata) : undefined}
                onSubmit={handleSubmit}
                isLoading={isBusy}
                submitLabel={submitLabel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
