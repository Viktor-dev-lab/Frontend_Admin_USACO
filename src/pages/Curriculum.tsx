import React, { useState, useEffect, useCallback } from 'react';
import styles from './Curriculum.module.css';
import { 
  Layers, GripVertical, FileText, Plus, Edit2, 
  Lock, Flame, ChevronRight, Trash2, Home, BarChart2, BookOpen,
  Loader2, AlertCircle
} from 'lucide-react';
import PlatformModal from '../components/curriculum/PlatformModal';
import LessonEditor from '../components/curriculum/LessonEditor';
import DivisionModal from '../components/curriculum/DivisionModal';
import ModuleModal from '../components/curriculum/ModuleModal';
import divisionService from '../services/divisionService';
import moduleService from '../services/moduleService';
import lessonService from '../services/lessonService';
import type { Division, Lesson, Module } from '../types/curriculum';

type ViewMode = 'list' | 'builder' | 'editor';

const Curriculum = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeDivisionId, setActiveDivisionId] = useState<number | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isModulesLoading, setIsModulesLoading] = useState(false);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const activeDivision = divisions.find(d => d.id === activeDivisionId) || null;

  const fetchDivisions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await divisionService.getDivisions();
      setDivisions(data);
    } catch (err: any) {
      console.error('Failed to fetch divisions:', err);
      setError('Could not load divisions. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  // --- Division Actions ---
  const handleSaveDivision = async (div: Division) => {
    try {
      if (editingDivision) {
        await divisionService.updateDivision(div.id, {
          name: div.name,
          min_rating: div.min_rating,
          max_rating: div.max_rating,
          description: div.description
        });
      } else {
        await divisionService.createDivision({
          name: div.name,
          min_rating: div.min_rating,
          max_rating: div.max_rating,
          description: div.description
        });
      }
      await fetchDivisions();
      setEditingDivision(null);
      setIsDivisionModalOpen(false);
    } catch (err) {
      alert('Failed to save division. Please try again.');
    }
  };

  const handleDeleteDivision = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this division? This action cannot be undone.')) {
      try {
        await divisionService.deleteDivision(id);
        setDivisions(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        alert('Failed to delete division.');
      }
    }
  };

  const openEditDivision = (div: Division, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDivision(div);
    setIsDivisionModalOpen(true);
  };

  const handleSelectDivision = async (divisionId: number) => {
    setActiveDivisionId(divisionId);
    setViewMode('builder');
    await refreshModulesAndLessons(divisionId);
  };

  const refreshModulesAndLessons = async (divisionId: number) => {
    setIsModulesLoading(true);
    try {
      // 1. Fetch all modules for this division
      const modules = await moduleService.getModulesByDivisionId(divisionId);
      
      // 2. For each module, fetch its lessons in parallel
      const modulesWithLessons = await Promise.all(
        modules.map(async (mod) => {
          try {
            const lessons = await lessonService.getLessonsByModuleId(mod.id);
            return { ...mod, lessons };
          } catch (err) {
            console.error(`Failed to fetch lessons for module ${mod.id}:`, err);
            return { ...mod, lessons: [] };
          }
        })
      );

      // 3. Update main state
      setDivisions(prev => prev.map(d => 
        d.id === divisionId ? { ...d, modules: modulesWithLessons } : d
      ));
    } catch (err) {
      console.error('Failed to refresh curriculum data:', err);
    } finally {
      setIsModulesLoading(false);
    }
  };

  // --- Module & Lesson Actions ---
  const saveLesson = async (updatedLesson: Lesson): Promise<boolean> => {
    try {
      if (updatedLesson.id && updatedLesson.id > 10000) { // New lesson dummy ID logic
        const newLesson = await lessonService.createLesson({
          module_id: updatedLesson.module_id,
          title: updatedLesson.title,
          slug: updatedLesson.slug,
          short_desc: updatedLesson.short_desc,
          frequency: updatedLesson.frequency,
          frequency_level: updatedLesson.frequency_level,
          order_index: updatedLesson.order_index,
          content_json: updatedLesson.content_json,
          has_premium_blocks: updatedLesson.has_premium_blocks
        });
        // Update activeLesson with real ID from server so subsequent saves use update, not create
        if (newLesson?.id) {
          setActiveLesson(prev => prev ? { ...prev, id: newLesson.id } : prev);
        }
      } else {
        await lessonService.updateLesson(updatedLesson.id, updatedLesson);
      }
      // Refresh sidebar data in background — don't navigate away
      if (activeDivisionId) {
        refreshModulesAndLessons(activeDivisionId); // intentionally not awaited
      }
      return true; // success
    } catch (err) {
      console.error('Failed to save lesson:', err);
      return false; // failure — LessonEditor will show error toast
    }
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: Module, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (data: Partial<Module>) => {
    if (!activeDivisionId) return;
    
    try {
      if (editingModule) {
        await moduleService.updateModule(editingModule.id, data);
      } else {
        await moduleService.createModule({
          division_id: activeDivisionId,
          title: data.title || 'New Module',
          order_index: data.order_index || (activeDivision?.modules?.length || 0) + 1
        });
      }
      // Refresh complete tree for the division
      if (activeDivisionId) {
        await refreshModulesAndLessons(activeDivisionId);
      }
      setIsModuleModalOpen(false);
      setEditingModule(null);
    } catch (err) {
      alert('Failed to save module.');
    }
  };

  const handleDeleteModule = async (moduleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeDivisionId) return;
    if (!window.confirm('Are you sure you want to delete this module and ALL its lessons?')) return;

    try {
      await moduleService.deleteModule(moduleId);
      await refreshModulesAndLessons(activeDivisionId);
    } catch (err) {
      alert('Failed to delete module.');
    }
  };

  const handleDeleteLesson = async (lessonId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeDivisionId) return;
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await lessonService.deleteLesson(lessonId);
      await refreshModulesAndLessons(activeDivisionId);
    } catch (err) {
      alert('Failed to delete lesson.');
    }
  };

  const handleAddLesson = (moduleId: number) => {
    // We create a temporary "new" lesson object with a high dummy ID to signal creation
    const newLesson: Lesson = {
      id: Date.now(), // Dummy ID for internal tracking in state
      module_id: moduleId,
      title: "New Lesson",
      slug: "new-lesson",
      short_desc: "",
      frequency: "High",
      frequency_level: 3,
      order_index: 99,
      content_json: [
        { id: 'blk_1', type: 'paragraph', content: 'Start typing your lesson here...', props: {} }
      ],
      has_premium_blocks: false
    };
    setActiveLesson(newLesson);
    setViewMode('editor');
  };

  const handleEditLesson = async (lesson: Lesson) => {
    setIsLessonLoading(true);
    try {
      const fullLesson = await lessonService.getLesson(lesson.slug);
      setActiveLesson(fullLesson);
      setViewMode('editor');
    } catch (err) {
      console.error('Failed to fetch lesson details:', err);
      alert('Failed to load lesson content. Please try again.');
    } finally {
      setIsLessonLoading(false);
    }
  };

  // --- Renderers ---

  // 1. Dashboard Mode: Division Grid
  const renderDivisionList = () => (
    <div className={`fade-in ${styles.contentWrapper}`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.headerTitle}><Layers size={24} color="var(--frappe-primary)"/> Curriculum Dashboard</h1>
          <p className={styles.headerDesc}>Manage your global study divisions and course structure.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setEditingDivision(null); setIsDivisionModalOpen(true); }}>
            <Plus size={16} /> Create Division
          </button>
        </div>
      </div>

      <div className={styles.divisionGrid}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', color: 'var(--frappe-text-muted)' }}>
            <Loader2 className="spin" size={32} />
            <p style={{ marginTop: 12 }}>Loading curriculum...</p>
          </div>
        ) : error ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', color: '#ef4444' }}>
            <AlertCircle size={32} />
            <p style={{ marginTop: 12 }}>{error}</p>
            <button className={styles.btnSecondary} onClick={fetchDivisions} style={{ marginTop: 16 }}>Retry</button>
          </div>
        ) : (
          <>
            {divisions.map(div => {
          const moduleCount = div.modules?.length || 0;
          const lessonCount = div.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

          return (
            <div key={div.id} className={styles.divisionCard} onClick={() => handleSelectDivision(div.id)}>
              <div className={styles.ratingBadge}>
                {div.min_rating} - {div.max_rating}
              </div>
              <h3 className={styles.divisionCardTitle}>{div.name}</h3>
              <p style={{ color: 'var(--frappe-text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>{div.description}</p>
              
              <div className={styles.divisionCardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{moduleCount}</span>
                  <span className={styles.statLabel}>Modules</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{lessonCount}</span>
                  <span className={styles.statLabel}>Lessons</span>
                </div>
              </div>

              <div className={styles.divisionActions}>
                <button className={styles.btnSecondary} onClick={(e) => openEditDivision(div, e)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                  <Edit2 size={12} /> Edit Info
                </button>
                <button 
                  className={styles.btnDanger} 
                  onClick={(e) => handleDeleteDivision(div.id, e)} 
                  style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: 'transparent', borderColor: 'transparent' }}
                >
                  <Trash2 size={12} /> Delete
                </button>
                <div style={{ marginLeft: 'auto' }}>
                  <ChevronRight size={18} color="var(--frappe-text-muted)" />
                </div>
              </div>
            </div>
          );
        })}

          <button 
            className={styles.divisionCard} 
            style={{ border: '2px dashed var(--frappe-border)', background: 'transparent', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => { setEditingDivision(null); setIsDivisionModalOpen(true); }}
          >
            <Plus size={32} color="var(--frappe-border)" />
            <span style={{ marginTop: 12, fontWeight: 600, color: 'var(--frappe-text-muted)' }}>Add New Division</span>
          </button>
          </>
        )}
      </div>
    </div>
  );

  // 2. Builder Mode: Module/Lesson List for active division
  const renderDivisionBuilder = () => {
    if (!activeDivision) return null;

    return (
      <div className={`fade-in ${styles.contentWrapper}`}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumb}>
          <div className={styles.breadcrumbItem} onClick={() => setViewMode('list')}><Home size={14}/> Dashboard</div>
          <div className={styles.breadcrumbSeparator}>/</div>
          <div className={styles.breadcrumbActive}>{activeDivision.name}</div>
        </div>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.headerTitle}>{activeDivision.name}</h1>
            <p className={styles.headerDesc}>{activeDivision.description}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              Save All Changes
            </button>
          </div>
        </div>

        {/* Builder View - Vertical Module Cards */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--frappe-text-main)', margin: 0 }}>Course Modules</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--frappe-text-muted)' }}>
              <span><BarChart2 size={14} /> {activeDivision.modules?.length} Modules</span>
              <span><BookOpen size={14} /> {activeDivision.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons</span>
            </div>
          </div>
          
          {isModulesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', color: 'var(--frappe-text-muted)' }}>
              <Loader2 className="spin" size={32} />
              <p style={{ marginTop: 12 }}>Loading course modules...</p>
            </div>
          ) : (
            <>
              {activeDivision.modules?.map((mod, mIndex) => (
                <div key={mod.id} className={styles.moduleCard}>
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleTitleBlock}>
                      <GripVertical className={styles.dragIcon} size={18} />
                      <h4 className={styles.moduleTitle}>Module {mIndex + 1}: {mod.title}</h4>
                    </div>
                    <div className={styles.moduleActions}>
                      <button className={styles.iconBtn} onClick={(e) => handleOpenEditModule(mod, e)}><Edit2 size={16} /></button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} onClick={(e) => handleDeleteModule(mod.id, e)}><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className={styles.lessonList}>
                    {mod.lessons?.map(lesson => (
                      <div key={lesson.id} className={styles.lessonItem}>
                        <GripVertical className={styles.dragIcon} size={16} />
                        <FileText size={16} color="var(--frappe-text-muted)" />
                        
                        <div className={styles.lessonInfo}>
                          <div className={styles.lessonTitle} onClick={() => handleEditLesson(lesson)}>
                            {lesson.title}
                          </div>
                          <div className={styles.lessonMeta}>
                            <span>{lesson.slug}</span>
                            {lesson.frequency_level && lesson.frequency_level >= 4 && (
                              <span className={styles.badge}><Flame size={12} color="#f97316"/> High Frequency</span>
                            )}
                            {lesson.has_premium_blocks && (
                              <span className={`${styles.badge} ${styles.premium}`}><Lock size={12}/> Premium</span>
                            )}
                          </div>
                        </div>

                        <div className={styles.moduleActions}>
                          <button 
                            className={`${styles.iconBtn} ${styles.danger}`} 
                            onClick={(e) => handleDeleteLesson(lesson.id, e)}
                            title="Delete Lesson"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className={styles.ghostBtn} onClick={() => handleAddLesson(mod.id)}>
                      <Plus size={16} /> Add New Lesson
                    </button>
                  </div>
                </div>
              ))}

              <button className={styles.ghostBtn} style={{ border: '2px dashed var(--frappe-border)', borderRadius: 8, marginTop: 24, padding: 16 }} onClick={handleAddModule}>
                <Plus size={18} /> Add New Module
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Main UI Switcher
  if (viewMode === 'editor' && activeLesson) {
    return (
      <div className={styles.pageContainer}>
        <LessonEditor lesson={activeLesson} onBack={() => setViewMode('builder')} onSave={saveLesson} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {viewMode === 'list' ? renderDivisionList() : renderDivisionBuilder()}

      {isLessonLoading && (
        <div className={styles.modalOverlay} style={{ zIndex: 3000 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
            <Loader2 className="spin" size={48} />
            <p style={{ marginTop: 16, fontWeight: 600 }}>Fetching lesson content...</p>
          </div>
        </div>
      )}

      <DivisionModal 
        isOpen={isDivisionModalOpen} 
        onClose={() => { setIsDivisionModalOpen(false); setEditingDivision(null); }} 
        onSave={handleSaveDivision}
        initialData={editingDivision}
      />
      <ModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => { setIsModuleModalOpen(false); setEditingModule(null); }}
        onSave={handleSaveModule}
        initialData={editingModule}
      />
    </div>
  );
};

export default Curriculum;
