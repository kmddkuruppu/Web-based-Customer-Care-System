import { useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { useFetch } from '../../utils/useFetch';
import { asList, errMsg } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import FormField from '../../components/FormField';

const EMPTY = { name: '', description: '', active: true };

export default function CategoryManagement() {
  const { data, loading, error, reload } = useFetch(() => categoryService.getAll(), []);
  const categories = asList(data);

  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [success, setSuccess] = useState('');
  const [pageErr, setPageErr] = useState('');

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setApiErr(''); setShow(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', active: c.active !== false });
    setErrors({}); setApiErr(''); setShow(true);
  };

  const save = async () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Category name is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true); setApiErr('');
    try {
      const payload = { ...form, name: form.name.trim(), description: form.description.trim() };
      if (editing) await categoryService.update(editing.id, payload);
      else await categoryService.create(payload);
      setSuccess(editing ? 'Category updated.' : 'Category created.');
      setShow(false);
      reload();
    } catch (err) {
      setApiErr(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const c = toDelete;
    setToDelete(null);
    try {
      await categoryService.remove(c.id);
      setSuccess('Category deleted.');
      reload();
    } catch (err) {
      setPageErr(errMsg(err));
    }
  };

  return (
    <>
      <div className="page-head">
        <h2 className="page-title">Complaint Categories</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
      </div>
      <Alert message={error || pageErr} onClose={() => setPageErr('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      {loading ? <Loader /> : (
        <div className="card">
          {categories.length === 0 ? <div className="empty">No categories yet.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.description || '—'}</td>
                      <td><span className={`badge ${c.active !== false ? 'badge-RESOLVED' : 'badge-ARCHIVED'}`}>{c.active !== false ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setToDelete(c)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        show={show}
        title={editing ? 'Update Category' : 'Create Category'}
        onClose={() => setShow(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <Alert message={apiErr} />
        <FormField label="Category Name" error={errors.name}>
          <input className={`input ${errors.name ? 'invalid' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <label className="check">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
        </label>
      </Modal>

      <ConfirmModal
        show={!!toDelete}
        title="Delete Category"
        message={toDelete ? `Delete "${toDelete.name}"? This cannot be undone.` : ''}
        confirmText="Delete"
        variant="danger"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
