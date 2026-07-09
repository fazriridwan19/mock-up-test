import { Pencil } from 'lucide-react';
import type { Biodata } from '../../types';
import { Modal } from '../../components/Modal';
import { BiodataView } from '../biodata/BiodataView';
import { Button } from '../../components/Button';

interface Props {
  biodata: Biodata;
  onClose: () => void;
  /** Called when admin clicks "Edit Biodata" — opens the edit modal */
  onEdit: () => void;
}

export function AdminDetailModal({ biodata, onClose, onEdit }: Props) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Detail Biodata"
      subtitle={biodata.fullName}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button icon={<Pencil size={14} />} onClick={onEdit}>
            Edit Biodata
          </Button>
        </>
      }
    >
      <BiodataView biodata={biodata} />
    </Modal>
  );
}
