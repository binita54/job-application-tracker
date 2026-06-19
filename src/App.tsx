import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication
} from './api';
import type { Application, ApplicationPayload, ApplicationStatus, JobType } from './types';
import { jobTypes, statuses } from './types';
import { formatDate, jobTypeLabels, statusLabels, toDateInputValue } from './utils';

type Mode = 'create' | 'edit';
type FormState = {
  companyName: string;
  jobTitle: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string;
};

const emptyForm: FormState = {
  companyName: '',
  jobTitle: '',
  jobType: 'Internship',
  status: 'Applied',
  appliedDate: new Date().toISOString().slice(0, 10),
  notes: ''
};

// Form validation helper - ensures required fields are not empty
const validateForm = (form: FormState): boolean => {
  return form.companyName.trim() !== '' && form.jobTitle.trim() !== '';
};

function getInitials(company: string) {
  return company
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toPayload(form: FormState): ApplicationPayload {
  return {
    companyName: form.companyName.trim(),
    jobTitle: form.jobTitle.trim(),
    jobType: form.jobType,
    status: form.status,
    appliedDate: form.appliedDate,
    notes: form.notes.trim() || null
  };
}

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (form.companyName.trim().length < 2) {
    errors.companyName = 'Company name must be at least 2 characters.';
  }

  if (!form.jobTitle.trim()) {
    errors.jobTitle = 'Job title is required.';
  }

  if (!form.appliedDate) {
    errors.appliedDate = 'Applied date is required.';
  }

  return errors;
}

export function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mode, setMode] = useState<Mode>('create');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(
    () =>
      statuses.reduce<Record<ApplicationStatus, number>>(
        (accumulator, status) => ({
          ...accumulator,
          [status]: applications.filter((application) => application.status === status).length
        }),
        { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 }
      ),
    [applications]
  );

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listApplications({ status: statusFilter, search, page });
      setApplications(data.items);
      setTotalPages(Math.max(data.meta.totalPages, 1));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      void loadApplications();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [loadApplications, search]);

  function openCreate() {
    setMode('create');
    setForm(emptyForm);
    setErrors({});
    setIsPanelOpen(true);
  }

  function openEdit(application: Application) {
    setMode('edit');
    setSelected(application);
    setForm({
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      jobType: application.jobType,
      status: application.status,
      appliedDate: toDateInputValue(application.appliedDate),
      notes: application.notes ?? ''
    });
    setErrors({});
    setIsPanelOpen(true);
  }

  async function openDetails(id: string) {
    try {
      setError(null);
      const application = await getApplication(id);
      setSelected(application);
      setIsDetailsOpen(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load application.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      if (mode === 'create') {
        await createApplication(toPayload(form));
        setMessage('Application created.');
      } else if (selected) {
        await updateApplication(selected.id, toPayload(form));
        setMessage('Application updated.');
      }

      setIsPanelOpen(false);
      await loadApplications();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save application.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setSaving(true);
      await deleteApplication(deleteTarget.id);
      setMessage('Application deleted.');
      setDeleteTarget(null);
      await loadApplications();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete application.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Mini Job Application Tracker</p>
          <h1>Applications</h1>
        </div>
        <button className="primary-button" type="button" onClick={openCreate}>
          <Plus size={18} />
          Add application
        </button>
      </section>

      <section className="stats-grid" aria-label="Application status summary">
        {statuses.map((status) => (
          <button
            className={`stat-card ${statusFilter === status ? 'active' : ''}`}
            key={status}
            type="button"
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
          >
            <span>{statusLabels[status]}</span>
            <strong>{counts[status]}</strong>
          </button>
        ))}
      </section>

      <section className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label="Search applications"
            placeholder="Search company or job title"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="segment-control" aria-label="Filter by status">
          {(['All', ...statuses] as const).map((status) => (
            <button
              className={statusFilter === status ? 'selected' : ''}
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {status === 'All' ? 'All' : statusLabels[status]}
            </button>
          ))}
        </div>
      </section>

      {message && (
        <div className="notice success" role="status">
          <Check size={18} />
          {message}
          <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="notice error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="table-wrap">
        {loading ? (
          <div className="empty-state">
            <Loader2 className="spin" size={28} />
            Loading applications
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={32} />
            No applications found
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Job title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Applied date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <div className="company-cell">
                      <span className="avatar">{getInitials(application.companyName)}</span>
                      <span>{application.companyName}</span>
                    </div>
                  </td>
                  <td>{application.jobTitle}</td>
                  <td>{jobTypeLabels[application.jobType]}</td>
                  <td>
                    <span className={`status-pill ${application.status.toLowerCase()}`}>
                      {statusLabels[application.status]}
                    </span>
                  </td>
                  <td>{formatDate(application.appliedDate)}</td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => void openDetails(application.id)} title="View">
                        <Eye size={17} />
                      </button>
                      <button type="button" onClick={() => openEdit(application)} title="Edit">
                        <Pencil size={17} />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(application)} title="Delete">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="pagination" aria-label="Pagination">
        <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
          <ChevronLeft size={17} />
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
          <ChevronRight size={17} />
        </button>
      </section>

      {isPanelOpen && (
        <div className="overlay" role="presentation">
          <aside className="side-panel" aria-label={mode === 'create' ? 'Add application' : 'Edit application'}>
            <div className="panel-header">
              <h2>{mode === 'create' ? 'Add application' : 'Edit application'}</h2>
              <button type="button" onClick={() => setIsPanelOpen(false)} aria-label="Close form">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <label>
                Company name
                <input
                  value={form.companyName}
                  onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                  minLength={2}
                  required
                />
                {errors.companyName && <small>{errors.companyName}</small>}
              </label>
              <label>
                Job title
                <input
                  value={form.jobTitle}
                  onChange={(event) => setForm({ ...form, jobTitle: event.target.value })}
                  required
                />
                {errors.jobTitle && <small>{errors.jobTitle}</small>}
              </label>
              <div className="form-grid">
                <label>
                  Job type
                  <select
                    value={form.jobType}
                    onChange={(event) => setForm({ ...form, jobType: event.target.value as JobType })}
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {jobTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value as ApplicationStatus })}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Applied date
                <input
                  type="date"
                  value={form.appliedDate}
                  onChange={(event) => setForm({ ...form, appliedDate: event.target.value })}
                  required
                />
                {errors.appliedDate && <small>{errors.appliedDate}</small>}
              </label>
              <label>
                Notes
                <textarea
                  rows={5}
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                />
              </label>
              <div className="panel-actions">
                <button type="button" className="secondary-button" onClick={() => setIsPanelOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving && <Loader2 className="spin" size={16} />}
                  {mode === 'create' ? 'Create' : 'Save changes'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {isDetailsOpen && selected && (
        <div className="overlay center" role="presentation">
          <article className="details-modal" aria-label="Application details">
            <div className="panel-header">
              <h2>{selected.companyName}</h2>
              <button type="button" onClick={() => setIsDetailsOpen(false)} aria-label="Close details">
                <X size={18} />
              </button>
            </div>
            <p className="detail-title">{selected.jobTitle}</p>
            <div className="detail-grid">
              <span>Type</span>
              <strong>{jobTypeLabels[selected.jobType]}</strong>
              <span>Status</span>
              <strong>{statusLabels[selected.status]}</strong>
              <span>Applied</span>
              <strong>{formatDate(selected.appliedDate)}</strong>
              <span>Updated</span>
              <strong>{formatDate(selected.updatedAt)}</strong>
            </div>
            {selected.notes && <p className="notes">{selected.notes}</p>}
          </article>
        </div>
      )}

      {deleteTarget && (
        <div className="overlay center" role="presentation">
          <article className="confirm-modal" aria-label="Confirm delete">
            <h2>Delete application?</h2>
            <p>
              This will remove the {deleteTarget.jobTitle} application at {deleteTarget.companyName}.
            </p>
            <div className="panel-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={() => void confirmDelete()} disabled={saving}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
