import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { biodataService } from "../../services/biodata.service";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { JobProgressBanner } from "../../components/JobProgressBanner";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { getErrorMessage, formatDate, degreeLabels } from "../../utils/format";
import { useJobPoller } from "../../hooks/useJobPoller";
import type { Biodata } from "../../types";
import { AdminDetailModal } from "./AdminDetailModal";
import { AdminEditModal } from "./AdminEditModal";

interface RunningJob {
  jobId: string;
  label: string;
  biodataId: string;
}

function StatCard({
  label,
  value,
  icon,
  color,
}: Readonly<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}>) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

export function AdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [appliedPosition, setAppliedPosition] = useState("");
  const [latestEducation, setLatestEducation] = useState("");
  const [viewBiodata, setViewBiodata] = useState<Biodata | null>(null);
  const [editBiodata, setEditBiodata] = useState<Biodata | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Biodata | null>(null);
  const [runningJobs, setRunningJobs] = useState<RunningJob[]>([]);

  // Debounce name search — fire query 400ms after user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNameChange = (value: string) => {
    setNameInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const LIMIT = 10;
  const DEGREES = [
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
  ] as const;

  const { data, isLoading } = useQuery({
    queryKey: [
      "admin",
      "biodata",
      { page, search, appliedPosition, latestEducation },
    ],
    queryFn: () =>
      biodataService.getAdminBiodataList({
        page,
        limit: LIMIT,
        search: search || undefined,
        appliedPosition: appliedPosition || undefined,
        latestEducation: latestEducation || undefined,
      }),
  });

  const addJob = (job: RunningJob) => setRunningJobs((p) => [...p, job]);
  const removeJob = (jobId: string) =>
    setRunningJobs((p) => p.filter((j) => j.jobId !== jobId));
  const isRowBusy = (id: string) => runningJobs.some((j) => j.biodataId === id);

  const JobPollerSlot = ({ job }: { job: RunningJob }) => {
    const onCompleted = useCallback(() => {
      removeJob(job.jobId);
      queryClient.invalidateQueries({ queryKey: ["admin", "biodata"] });
      toast.success(`${job.label} selesai`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.jobId]);
    const onFailed = useCallback(
      (err: string) => {
        removeJob(job.jobId);
        toast.error(`${job.label} gagal: ${err}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [job.jobId],
    );
    useJobPoller({
      jobId: job.jobId,
      basePath: "/admin/jobs",
      onCompleted,
      onFailed,
    });
    return null;
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => biodataService.adminDeleteBiodata(id),
    onSuccess: ({ jobId }, biodataId) => {
      setDeleteTarget(null);
      addJob({ jobId, label: "Penghapusan biodata", biodataId });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setDeleteTarget(null);
    },
  });

  const handleClearFilter = () => {
    setSearch("");
    setNameInput("");
    setAppliedPosition("");
    setLatestEducation("");
    setPage(1);
  };

  const bioList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {runningJobs.map((job) => (
        <JobPollerSlot key={job.jobId} job={job} />
      ))}

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-700
                        flex items-center justify-center shadow-md shadow-blue-500/25"
        >
          <LayoutDashboard size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm">
            Kelola seluruh data biodata pelamar
          </p>
        </div>
      </div>

      {/* Job banners */}
      <AnimatePresence>
        {runningJobs.map((job) => (
          <JobProgressBanner
            key={job.jobId}
            label={job.label}
            jobId={job.jobId}
          />
        ))}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Biodata"
          value={meta?.total ?? 0}
          icon={<Users size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Ditampilkan"
          value={bioList.length}
          icon={<GraduationCap size={20} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
      </div>

      {/* Filter */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Nama — debounced */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl
                         bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2
                         focus:ring-blue-100 outline-none transition-colors"
              placeholder="Cari nama..."
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          {/* Posisi — instant */}
          <input
            type="text"
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50
                       focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                       outline-none transition-colors"
            placeholder="Posisi dilamar..."
            value={appliedPosition}
            onChange={(e) => {
              setAppliedPosition(e.target.value);
              setPage(1);
            }}
          />

          {/* Jenjang — instant */}
          <select
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50
                       focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                       outline-none transition-colors"
            value={latestEducation}
            onChange={(e) => {
              setLatestEducation(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Jenjang</option>
            {DEGREES.map((d) => (
              <option key={d} value={d}>
                {degreeLabels[d]}
              </option>
            ))}
          </select>

          {/* Reset */}
          <Button
            type="button"
            variant="secondary"
            icon={<RotateCcw size={14} />}
            onClick={handleClearFilter}
          >
            Reset Filter
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-500" />
            <span className="font-semibold text-slate-700 text-sm">
              Daftar Biodata
            </span>
          </div>
          {meta && <Badge color="blue">{meta.total} total</Badge>}
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner text="Memuat data..." />
          </div>
        ) : bioList.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              Tidak ada data ditemukan
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Coba ubah filter pencarian Anda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "#",
                    "Nama Lengkap",
                    "Posisi Dilamar",
                    "Tempat Lahir",
                    "Tanggal Lahir",
                    "Pendidikan",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold
                                          text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bioList.map((bio, i) => {
                  const latestEdu = bio.educationHistories?.slice(-1)[0];
                  const busy = isRowBusy(bio.id);
                  return (
                    <motion.tr
                      key={bio.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors
                                  ${busy ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                        {(page - 1) * LIMIT + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                          flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          >
                            {bio.fullName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {bio.fullName}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {bio.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color="indigo">{bio.appliedPosition}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {bio.birthPlace}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(bio.birthDate)}
                      </td>
                      <td className="px-4 py-3">
                        {latestEdu ? (
                          <Badge color="purple">
                            {degreeLabels[latestEdu.degree]}
                          </Badge>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={busy}
                            onClick={() => setViewBiodata(bio)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-600
                                       flex items-center justify-center text-slate-500 transition-colors
                                       disabled:opacity-40"
                            title="Lihat Detail"
                          >
                            <Eye size={13} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={busy}
                            onClick={() => setEditBiodata(bio)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-600
                                       flex items-center justify-center text-slate-500 transition-colors
                                       disabled:opacity-40"
                            title="Edit"
                          >
                            {busy ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Pencil size={13} />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={busy}
                            onClick={() => setDeleteTarget(bio)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600
                                       flex items-center justify-center text-slate-500 transition-colors
                                       disabled:opacity-40"
                            title="Hapus"
                          >
                            {busy ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <span className="text-slate-500 text-xs">
              Halaman{" "}
              <span className="font-semibold text-slate-700">{page}</span> dari{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center
                           text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                                ${
                                  page === p
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center
                           text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={14} />}
              loading={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              Hapus Biodata
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-slate-700 text-sm">
              Anda akan menghapus biodata{" "}
              <span className="font-bold text-slate-900">
                {deleteTarget?.fullName}
              </span>
              .
            </p>
            <p className="text-slate-500 text-xs mt-1.5">
              Data ini akan dihapus secara permanen dan tidak dapat dipulihkan.
            </p>
          </div>
        </div>
      </Modal>

      {viewBiodata && (
        <AdminDetailModal
          biodata={viewBiodata}
          onClose={() => setViewBiodata(null)}
        />
      )}
      {editBiodata && (
        <AdminEditModal
          biodata={editBiodata}
          onClose={() => setEditBiodata(null)}
          onEnqueued={(jobId) => {
            addJob({
              jobId,
              label: `Update ${editBiodata.fullName}`,
              biodataId: editBiodata.id,
            });
            setEditBiodata(null);
          }}
        />
      )}
    </div>
  );
}
