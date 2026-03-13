'use client';
import { useState, useRef, useCallback } from 'react';
import { smartUpload } from '@/lib/api/upload';

const STATUS_LABEL: any = {
  queued: 'Chờ xử lý',
  uploading: 'Đang upload...',
  done: 'Hoàn thành',
  error: 'Lỗi',
};

const STATUS_BADGE: any = {
  queued: 'bg-secondary',
  uploading: 'bg-primary',
  done: 'bg-success',
  error: 'bg-danger',
};

export default function UploadManager() {
  const [jobs, setJobs] = useState<any[]>([]);
  
  function updateJob(id: string, data: any){
    setJobs(prev => prev.map(j => j.id === id ? {...j, ...data} : j))
  }

  async function runUpload(file:File) {
    const jobId = Math.random().toString(36).substring(7);
    const isMultiPart =  file.size > (5 * 1024 * 1024);

    // them job mới vào
    const newJob = {id: jobId, file, status: 'uploading', progress: 0, mode: isMultiPart ? 'multipart': 'single'}
    setJobs(prev => [...prev, newJob]);
    try {
      const { key } = await smartUpload(file, (pct) => {
        updateJob(jobId, {progress: pct})
      })
      updateJob(jobId, {status: 'done', progress: 100, resultKey: key})
    } catch(err: any) {
      updateJob(jobId, {status: 'error', errorMessage: err.message})
    }
  }

  const handleFileSelected = (files: FileList) => {
    Array.from(files).forEach(file => runUpload(file))
  }
  const handleRemove = (id:string) => setJobs(prev => prev.filter(j => j.id !== id));
  const handleClearDone = () => setJobs(prev => prev.filter(j => j.status !== 'done' && j.status !== 'error'))

  const activeCount = jobs.filter(j => j.status === 'uploading').length;
  const doneCount = jobs.filter(j => j.status === 'done').length;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">Quản lý upload</h5>
          {jobs.length > 0 && (
            <small className="text-muted">
              {activeCount > 0 && `${activeCount} đang xử lý · `}
              {doneCount} / {jobs.length} hoàn thành
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          {doneCount > 0 && (
            <button className="btn btn-outline-secondary btn-sm" onClick={handleClearDone}>Xóa đã xong</button>
          )}
          <label className="btn btn-primary btn-sm mb-0">
            + Thêm file
            <input type="file" multiple hidden onChange={e => e.target.files && handleFileSelected(e.target.files)} />
          </label>
        </div>
      </div>

      {/* Danh sách jobs */}
      {jobs.length === 0 ? (
        <div className="text-center text-muted py-5 border rounded">
          <p className="mb-1">Chưa có file nào</p>
          <small>Nhấn "+ Thêm file" để bắt đầu upload</small>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {jobs.map(job => (
            <div key={job.id} className="card border p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                {/* Tên file + size */}
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <FileIcon type={job.file.type} />
                  <div className="overflow-hidden">
                    <div className="text-truncate fw-medium small" style={{ maxWidth: 260 }}>
                      {job.file.name}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {formatBytes(job.file.size)}
                    </div>
                  </div>
                </div>
                {/* Badge trạng thái + nút xóa */}
                <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                  <span className={`badge ${STATUS_BADGE[job.status]}`} style={{ fontSize: 11 }}>
                    {STATUS_LABEL[job.status]}
                  </span>
                  {(job.status === 'done' || job.status === 'error' || job.status === 'queued') && (
                    <button
                      className="btn btn-sm btn-outline-secondary p-0 px-1"
                      style={{ lineHeight: 1.2, fontSize: 12 }}
                      onClick={() => handleRemove(job.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {job.status === 'uploading' && (
                <div>
                  <div className="d-flex justify-content-between" style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>
                    <span>
                      {job.mode === 'multipart'
                        ? `Chunked upload · ${job.progress}%`
                        : `Direct upload · ${job.progress}%`}
                    </span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Thông báo lỗi */}
              {job.status === 'error' && (
                <div className="text-danger mt-1" style={{ fontSize: 12 }}>
                  {job.errorMsg}
                </div>
              )}

              {/* Key kết quả */}
              {job.status === 'done' && job.resultKey && (
                <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                  Key: {job.resultKey}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  let icon = '';
  if (type.startsWith('image/'))  icon = '';
  if (type.startsWith('video/'))  icon = '';
  if (type.startsWith('audio/'))  icon = '';
  if (type === 'application/pdf') icon = '';
  if (type === 'text/csv')        icon = '';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) icon = '';
  return <span style={{ fontSize: 20 }}>{icon}</span>;
}
