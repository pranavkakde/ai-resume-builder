import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Application } from '../types';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import './TrackerPage.css';

interface FormData {
  company_name: string;
  job_title: string;
  jd_text: string;
  status: string;
  notes: string;
  applied_date: string;
  match_score: number;
}

const emptyForm: FormData = {
  company_name: '',
  job_title: '',
  jd_text: '',
  status: 'saved',
  notes: '',
  applied_date: '',
  match_score: 0,
};

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getApplications(statusFilter);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter(
      a =>
        a.company_name.toLowerCase().includes(q) ||
        a.job_title.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (app: Application) => {
    setEditingId(app.id);
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      jd_text: app.jd_text || '',
      status: app.status,
      notes: app.notes || '',
      applied_date: app.applied_date || '',
      match_score: app.match_score || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await updateApplication(editingId, formData);
      } else {
        await createApplication(formData as unknown as Partial<Application>);
      }
      setShowModal(false);
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateApplication(id, { status });
      setApplications(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      );
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteApplication(deleteId);
      setApplications(prev => prev.filter(a => a.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page tracker-page container">
      <div className="tracker-page__header">
        <h1 className="tracker-page__title">
          📊 Application Tracker{' '}
          <span className="tracker-page__count">({applications.length})</span>
        </h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Application
        </button>
      </div>

      <div className="tracker-filters">
        <input
          className="tracker-filters__search"
          type="text"
          placeholder="Search by company or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="tracker-filters__status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="tracker-loading">
          <div className="spinner spinner-lg" />
        </div>
      ) : error ? (
        <div className="tracker-empty">
          <div className="tracker-empty__icon">😕</div>
          <p className="tracker-empty__text">{error}</p>
          <button className="btn btn-primary" onClick={fetchApplications}>
            ↻ Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tracker-empty">
          <div className="tracker-empty__icon">📋</div>
          <p className="tracker-empty__text">No applications yet</p>
          <p className="tracker-empty__subtext">
            Start tracking your job applications to stay organized
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Your First Application
          </button>
        </div>
      ) : (
        <div className="tracker-grid">
          {filtered.map((app, idx) => (
            <ApplicationCard
              key={app.id}
              application={app}
              index={idx}
              onStatusChange={handleStatusChange}
              onEdit={openEditModal}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div
            className="tracker-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="tracker-modal__header">
              <h2 className="tracker-modal__title">
                {editingId ? '✎ Edit Application' : '+ New Application'}
              </h2>
              <button
                className="tracker-modal__close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="tracker-modal__form">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  className="form-input"
                  value={formData.company_name}
                  onChange={e => updateField('company_name', e.target.value)}
                  placeholder="e.g., Google"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  className="form-input"
                  value={formData.job_title}
                  onChange={e => updateField('job_title', e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={e => updateField('status', e.target.value)}
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Applied Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={formData.applied_date}
                  onChange={e => updateField('applied_date', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  placeholder="Add any notes about this application..."
                  rows={3}
                />
              </div>

              <div className="tracker-modal__actions">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    !formData.company_name.trim() ||
                    !formData.job_title.trim()
                  }
                >
                  {isSaving ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16 }} /> Saving...
                    </>
                  ) : editingId ? (
                    'Update'
                  ) : (
                    'Add Application'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────── */}
      {deleteId !== null && (
        <div className="overlay" onClick={() => setDeleteId(null)}>
          <div
            className="tracker-delete-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="tracker-delete-modal__icon">🗑️</div>
            <p className="tracker-delete-modal__text">Delete this application?</p>
            <p className="tracker-delete-modal__subtext">This action cannot be undone.</p>
            <div className="tracker-delete-modal__actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
