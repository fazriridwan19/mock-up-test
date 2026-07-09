import type { Biodata } from '../../types';
import { Modal } from '../../components/Modal';
import { BiodataView } from '../biodata/BiodataView';
import { Button } from '../../components/Button';

interface Props {
  biodata: Biodata;
  onClose: () => void;
}

export function AdminDetailModal({ biodata, onClose }: Props) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Detail Biodata`}
      subtitle={biodata.fullName}
      size="xl"
      footer={
        <Button variant="secondary" onClick={onClose}>Tutup</Button>
      }
    >
      <BiodataView biodata={biodata} />
    </Modal>
  );
}
