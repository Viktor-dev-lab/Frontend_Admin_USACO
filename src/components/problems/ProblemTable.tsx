import React, { useState } from 'react';
import { 
  SquarePen, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  Beaker, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Hash,
  Tags,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Problems.module.css';
import type { Problem } from '../../types/problem';

interface ProblemTableProps {
  problems: Problem[];
  onDelete: (id: string) => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const DIFFICULTY_LABEL = (d: number) => {
  if (d < 900) return { label: 'Newbie', color: '#9ca3af' };
  if (d < 1200) return { label: 'Pupil', color: '#4ade80' };
  if (d < 1400) return { label: 'Specialist', color: '#38bdf8' };
  if (d < 1600) return { label: 'Expert', color: '#818cf8' };
  if (d < 1900) return { label: 'Candidate M.', color: '#c084fc' };
  return { label: 'Master+', color: '#f97316' };
};

const STATUS_CONFIG = {
  ready: { label: 'Ready', color: '#10b981', icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.1)' },
  draft: { label: 'Draft', color: '#9ca3af', icon: FileText, bg: 'rgba(156, 163, 175, 0.1)' },
  under_preview: { label: 'Preview', color: '#3b82f6', icon: Clock, bg: 'rgba(59, 130, 246, 0.1)' },
  archived: { label: 'Archived', color: '#f59e0b', icon: Archive, bg: 'rgba(245, 158, 11, 0.1)' },
  deleted: { label: 'Deleted', color: '#ef4444', icon: AlertCircle, bg: 'rgba(239, 68, 68, 0.1)' },
};

const ProblemTable: React.FC<ProblemTableProps> = ({ 
  problems, 
  onDelete,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const totalPages = Math.ceil(total / limit);

  // Filter local data only for search term display purposes if needed, 
  // but real search should be server-side. For now, we search in the current page results.
  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.external_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openStudio = (problem: Problem) => {
    navigate(`/problems/${problem.id}/studio`);
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableToolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select 
            className={styles.limitSelect} 
            value={limit} 
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {problems.length} of {total} results
          </span>
        </div>
        <div className={styles.actionsSection}>
          <button className={styles.btnOutline} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={16} /> Advanced
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID / External</th>
              <th style={{ minWidth: '250px' }}>Problem Info</th>
              <th style={{ minWidth: '200px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tags size={16} /> Categories</div></th>
              <th>Platform</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => {
                const diff = DIFFICULTY_LABEL(problem.difficulty);
                return (
                  <tr key={problem.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-h)' }}>
                        #{problem.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text)', fontFamily: 'monospace', marginTop: 2 }}>
                        {problem.external_id}
                      </div>
                    </td>

                    <td>
                      <div
                        onClick={() => openStudio(problem)}
                        style={{
                          fontWeight: 600, color: 'var(--accent)',
                          cursor: 'pointer', marginBottom: 6,
                          display: 'inline-block', transition: 'opacity 0.15s'
                        }}
                        className={styles.problemTitleLink}
                        title="Open Problem Authoring Studio"
                      >
                        {problem.title}
                      </div>
                      <div className={styles.metaRow}>
                        <span
                          className={styles.difficultyBadge}
                          style={{ color: diff.color, borderColor: diff.color + '55', background: diff.color + '18' }}
                        >
                          {problem.difficulty} · {diff.label}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                          <span>{problem.acceptance_rate}% Acc.</span>
                          <span>{problem.testcases?.length || 0} Testcases</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={styles.tagCloud}>
                        {problem.tags.map((tag, idx) => {
                          const tagName = typeof tag === 'string' ? tag : tag.name;
                          const tagKey = typeof tag === 'string' ? `tag-${idx}-${tag}` : (tag.id || `tag-${idx}`);
                          return (
                            <span key={tagKey} className={styles.taxonomyTag}>
                              {tagName}
                            </span>
                          );
                        })}
                        {(!problem.tags || problem.tags.length === 0) && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No tags</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-h)' }}>
                        {problem.platforms || problem.platform?.name || 'Local'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {problem.divisions || problem.division?.name || 'All'}
                      </div>
                    </td>

                    <td>
                      {(() => {
                        const cfg = (STATUS_CONFIG as any)[problem.status || 'draft'] || STATUS_CONFIG.draft;
                        const Icon = cfg.icon;
                        return (
                          <div 
                            className={styles.statusBadge}
                            style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}33` }}
                          >
                            <Icon size={14} />
                            <span>{cfg.label}</span>
                          </div>
                        );
                      })()}
                    </td>

                    <td className={styles.rowActions}>
                      <button
                        onClick={() => openStudio(problem)}
                        className={`${styles.iconBtn} ${styles.iconBtnPrimary}`}
                        title="Open Authoring Studio"
                      >
                        <Beaker size={18} strokeWidth={2} />
                      </button>

                      {problem.original_url && (
                        <a
                          href={problem.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconBtn}
                          title="View Original Problem"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}

                      <button
                        onClick={() => onDelete(problem.id)}
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        title="Delete Problem"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                  No problems found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className={styles.paginationFooter}>
          <div className={styles.paginationInfo}>
            Showing <strong>{problems.length}</strong> of <strong>{total}</strong> problems
          </div>
          <div className={styles.paginationControls}>
            <button 
              className={styles.pageBtn} 
              disabled={page === 1}
              onClick={() => onPageChange(1)}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              className={styles.pageBtn} 
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className={styles.pageNumbers}>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Show pages around current page
                let pageNum = page;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;

                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageNum} ${page === pageNum ? styles.activePageNum : ''}`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              className={styles.pageBtn} 
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              className={styles.pageBtn} 
              disabled={page === totalPages}
              onClick={() => onPageChange(totalPages)}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemTable;
