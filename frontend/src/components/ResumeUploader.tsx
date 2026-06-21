import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { uploadResume } from '../services/api';
import './ResumeUploader.css';

interface Props {
  resumeText: string;
  onTextChange: (text: string) => void;
  onFileUploaded: (filename: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUploader({ resumeText, onTextChange, onFileUploaded }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10 MB.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const result = await uploadResume(file);
      onTextChange(result.text);
      onFileUploaded(result.filename);
      setPageCount(result.page_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [onTextChange, onFileUploaded]);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setFileSize(0);
    setPageCount(0);
    onTextChange('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="resume-uploader glass-card">
      <h3 className="resume-uploader__title">📄 Upload Resume</h3>
      <p className="resume-uploader__subtitle">Upload your resume to get started</p>

      {isLoading ? (
        <div className="resume-uploader__loading">
          <div className="spinner spinner-lg" />
          <span className="resume-uploader__loading-text">Parsing your resume...</span>
        </div>
      ) : !resumeText ? (
        <div
          className={`resume-uploader__dropzone${dragActive ? ' resume-uploader__dropzone--active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload resume"
        >
          <span className="resume-uploader__dropzone-icon">☁️</span>
          <p className="resume-uploader__dropzone-text">
            Drag & drop your resume here, or <strong>browse</strong>
          </p>
          <span className="resume-uploader__dropzone-hint">Supports PDF, DOCX • Max 10 MB</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onInputChange}
          />
        </div>
      ) : (
        <>
          {fileName && (
            <div className="resume-uploader__file-info">
              <span className="resume-uploader__file-icon">📎</span>
              <div className="resume-uploader__file-details">
                <div className="resume-uploader__file-name">{fileName}</div>
                <div className="resume-uploader__file-meta">
                  {formatFileSize(fileSize)}
                  {pageCount > 0 && ` • ${pageCount} page${pageCount > 1 ? 's' : ''}`}
                </div>
              </div>
              <button
                className="resume-uploader__file-remove"
                onClick={handleRemove}
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          )}

          <div className="resume-uploader__text-preview">
            <div className="resume-uploader__text-preview-header">
              <span className="resume-uploader__text-preview-label">Extracted Text (editable)</span>
            </div>
            <textarea
              className="resume-uploader__text-area"
              value={resumeText}
              onChange={e => onTextChange(e.target.value)}
              placeholder="Resume text will appear here..."
            />
          </div>
        </>
      )}

      {error && (
        <div className="resume-uploader__error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
