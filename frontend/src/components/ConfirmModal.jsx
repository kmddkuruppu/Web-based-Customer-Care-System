import Modal from './Modal';

export default function ConfirmModal({
  show, title = 'Please Confirm', message, confirmText = 'Confirm',
  variant = 'primary', onConfirm, onCancel,
}) {
  return (
    <Modal
      show={show}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmText}</button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
