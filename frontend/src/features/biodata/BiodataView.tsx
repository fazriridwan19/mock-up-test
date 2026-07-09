import { motion } from 'framer-motion';
import {
  User, Phone, Sparkles, GraduationCap, Award, Building2,
  CheckCircle, XCircle,
} from 'lucide-react';
import type { Biodata } from '../../types';
import {
  formatDate, formatRupiah,
  genderLabels, religionLabels, maritalStatusLabels, degreeLabels,
} from '../../utils/format';
import { Badge } from '../../components/Badge';

interface Props { biodata: Biodata; }

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">{label}</p>
      <div className="text-sm font-medium text-slate-800">
        {value ?? <span className="text-slate-300 italic">—</span>}
      </div>
    </div>
  );
}

function DataGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>;
}

function HistoryTable({
  headers, children,
}: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      {/* Check if children is empty */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map((h) => (
              <th key={h} className="pb-2.5 pr-4 text-left text-xs font-semibold
                                     text-slate-400 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BiodataView({ biodata }: Props) {
  return (
    <div>
      {/* Applied position hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-4
                      flex items-center gap-4 shadow-lg shadow-blue-600/20">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center
                        text-white font-bold text-lg flex-shrink-0">
          {biodata.fullName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-0.5">
            Melamar untuk posisi
          </p>
          <p className="text-white text-lg font-bold">{biodata.appliedPosition}</p>
          <p className="text-blue-200 text-sm">{biodata.fullName}</p>
        </div>
      </div>

      {/* Data Pribadi */}
      <Section icon={<User size={15} />} title="Data Pribadi">
        <DataGrid>
          <Field label="Nama Lengkap" value={biodata.fullName} />
          <Field label="NIK" value={
            <span className="font-mono text-slate-700">{biodata.nationalIdNumber}</span>
          } />
          <Field label="Tempat Lahir" value={biodata.birthPlace} />
          <Field label="Tanggal Lahir" value={formatDate(biodata.birthDate)} />
          <Field label="Jenis Kelamin" value={genderLabels[biodata.gender]} />
          <Field label="Agama" value={religionLabels[biodata.religion]} />
          <Field label="Golongan Darah" value={biodata.bloodType
            ? <Badge color="red">{biodata.bloodType}</Badge> : undefined} />
          <Field label="Status Perkawinan" value={maritalStatusLabels[biodata.maritalStatus]} />
        </DataGrid>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">
              Alamat KTP
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {biodata.ktpAddress}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">
              Alamat Domisili
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {biodata.currentAddress}
            </p>
          </div>
        </div>
      </Section>

      {/* Kontak */}
      <Section icon={<Phone size={15} />} title="Informasi Kontak">
        <DataGrid>
          <Field label="Email" value={biodata.email} />
          <Field label="Nomor HP / WhatsApp" value={biodata.phoneNumber} />
          <Field label="Kontak Darurat" value={biodata.emergencyContact} />
        </DataGrid>
      </Section>

      {/* Keahlian */}
      <Section icon={<Sparkles size={15} />} title="Keahlian & Preferensi Kerja">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Keahlian</p>
            {biodata.skills ? (
              <div className="flex flex-wrap gap-2">
                {biodata.skills.split(',').map((s) => (
                  <Badge key={s.trim()} color="blue">{s.trim()}</Badge>
                ))}
              </div>
            ) : (
              <span className="text-slate-300 text-sm italic">Belum diisi</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Gaji yang Diharapkan"
              value={
                <span className="text-emerald-600 font-bold">
                  {formatRupiah(Number(biodata.expectedSalary))}
                </span>
              }
            />
            <Field
              label="Bersedia Ditempatkan di Mana Saja"
              value={biodata.willingToBePlaced ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle size={14} /> Ya, bersedia
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <XCircle size={14} /> Tidak
                </span>
              )}
            />
          </div>
        </div>
      </Section>

      {/* Pendidikan */}
      <Section icon={<GraduationCap size={15} />} title="Riwayat Pendidikan">
        {!biodata.educationHistories?.length ? (
          <p className="text-sm text-slate-400 italic">Belum ada data pendidikan.</p>
        ) : (
          <HistoryTable headers={['Institusi', 'Jurusan', 'Jenjang', 'Masuk', 'Lulus', 'IPK']}>
            {biodata.educationHistories.map((edu) => (
              <tr key={edu.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{edu.institution}</td>
                <td className="py-2.5 pr-4 text-slate-600">{edu.major}</td>
                <td className="py-2.5 pr-4">
                  <Badge color="purple">{degreeLabels[edu.degree]}</Badge>
                </td>
                <td className="py-2.5 pr-4 text-slate-500">{edu.startYear}</td>
                <td className="py-2.5 pr-4 text-slate-500">
                  {edu.endYear ?? <span className="text-amber-500 text-xs">Belum lulus</span>}
                </td>
                <td className="py-2.5 text-slate-500">
                  {edu.gpa ?? <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </HistoryTable>
        )}
      </Section>

      {/* Pelatihan */}
      <Section icon={<Award size={15} />} title="Riwayat Pelatihan & Sertifikasi">
        {!biodata.trainingHistories?.length ? (
          <p className="text-sm text-slate-400 italic">Belum ada data pelatihan.</p>
        ) : (
          <HistoryTable headers={['Nama Pelatihan', 'Penyelenggara', 'Tahun', 'Durasi', 'Sertifikat']}>
            {biodata.trainingHistories.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{t.name}</td>
                <td className="py-2.5 pr-4 text-slate-600">{t.organizer}</td>
                <td className="py-2.5 pr-4 text-slate-500">{t.year}</td>
                <td className="py-2.5 pr-4 text-slate-500">
                  {t.duration ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="py-2.5 text-slate-500">
                  {t.certificate ?? <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </HistoryTable>
        )}
      </Section>

      {/* Pekerjaan */}
      <Section icon={<Building2 size={15} />} title="Riwayat Pekerjaan">
        {!biodata.employmentHistories?.length ? (
          <p className="text-sm text-slate-400 italic">Belum ada data pekerjaan.</p>
        ) : (
          <HistoryTable headers={['Perusahaan', 'Jabatan', 'Mulai', 'Selesai', 'Gaji']}>
            {biodata.employmentHistories.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">{e.company}</td>
                <td className="py-2.5 pr-4 text-slate-600">{e.position}</td>
                <td className="py-2.5 pr-4 text-slate-500 whitespace-nowrap">
                  {formatDate(e.startDate)}
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {e.endDate
                    ? <span className="text-slate-500">{formatDate(e.endDate)}</span>
                    : <Badge color="green" dot>Aktif</Badge>}
                </td>
                <td className="py-2.5 text-slate-600">
                  {e.salary
                    ? <span className="font-semibold text-emerald-600">{formatRupiah(Number(e.salary))}</span>
                    : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </HistoryTable>
        )}
      </Section>
    </div>
  );
}
