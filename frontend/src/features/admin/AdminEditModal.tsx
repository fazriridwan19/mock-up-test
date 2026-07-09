import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { Biodata } from "../../types";
import { biodataService } from "../../services/biodata.service";
import { BiodataForm, BIODATA_FORM_ID, type BiodataFormValues } from "../biodata/BiodataForm";
import { getErrorMessage, toInputDate } from "../../utils/format";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";

interface Props {
  biodata: Biodata;
  onClose: () => void;
  onEnqueued: (jobId: string) => void;
}

export function AdminEditModal({
  biodata,
  onClose,
  onEnqueued,
}: Readonly<Props>) {
  const mutation = useMutation({
    mutationFn: (values: BiodataFormValues) =>
      biodataService.adminUpdateBiodata(
        biodata.id,
        values as Parameters<typeof biodataService.adminUpdateBiodata>[1],
      ),
    onSuccess: ({ jobId }) => onEnqueued(jobId),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const defaultValues: Partial<BiodataFormValues> = {
    appliedPosition: biodata.appliedPosition,
    fullName: biodata.fullName,
    nationalIdNumber: biodata.nationalIdNumber,
    birthPlace: biodata.birthPlace,
    birthDate: toInputDate(biodata.birthDate),
    gender: biodata.gender,
    religion: biodata.religion,
    bloodType: biodata.bloodType,
    maritalStatus: biodata.maritalStatus,
    ktpAddress: biodata.ktpAddress,
    currentAddress: biodata.currentAddress,
    email: biodata.email,
    phoneNumber: biodata.phoneNumber,
    emergencyContact: biodata.emergencyContact,
    skills: biodata.skills,
    willingToBePlaced: biodata.willingToBePlaced,
    expectedSalary: Number(biodata.expectedSalary),
    educationHistories: biodata.educationHistories?.map((e) => ({
      institution: e.institution,
      major: e.major,
      degree: e.degree,
      startYear: e.startYear,
      endYear: e.endYear ?? undefined,
      gpa: e.gpa ?? undefined,
    })),
    trainingHistories: biodata.trainingHistories?.map((t) => ({
      name: t.name,
      organizer: t.organizer,
      year: t.year,
      duration: t.duration ?? "",
      certificate: t.certificate ?? "",
    })),
    employmentHistories: biodata.employmentHistories?.map((e) => ({
      company: e.company,
      position: e.position,
      startDate: toInputDate(e.startDate),
      endDate: e.endDate ? toInputDate(e.endDate) : "",
      salary: e.salary ? Number(e.salary) : undefined,
      description: e.description ?? "",
    })),
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit Biodata"
      subtitle={biodata.fullName}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Batal
          </Button>
          {/* form= links this button to BiodataForm even though it's outside the <form> element */}
          <button
            type="submit"
            form={BIODATA_FORM_ID}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
                       bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl
                       shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-blue-600
                       transition-all active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {mutation.isPending ? "Menyimpan..." : "Perbarui Biodata"}
          </button>
        </>
      }
    >
      <BiodataForm
        defaultValues={defaultValues}
        onSubmit={(values) => mutation.mutate(values)}
        isLoading={mutation.isPending}
        submitLabel={mutation.isPending ? "Mengirim..." : "Perbarui Biodata"}
      />
    </Modal>
  );
}
