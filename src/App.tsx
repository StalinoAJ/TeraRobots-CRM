import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { RecordDrawer } from './components/RecordDrawer';
import { CreateRecordModal } from './components/CreateRecordModal';
import { CustomObjectModal } from './components/CustomObjectModal';
import { CommandMenu } from './components/CommandMenu';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { crmApi } from './api/tauriApi';
import {
  WorkspaceState,
  CrmRecord,
  AnalyticsSummary,
  ObjectMetadata,
} from './types/crm';

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [currentView, setCurrentView] = useState<string>('opportunity');
  const [activeViewType, setActiveViewType] = useState<'TABLE' | 'KANBAN'>('KANBAN');
  const [activeViewId, setActiveViewId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<CrmRecord | null>(null);
  const [isCreateRecordOpen, setIsCreateRecordOpen] = useState(false);
  const [createRecordInitialValues, setCreateRecordInitialValues] = useState<Record<string, any>>({});
  const [isCreateObjectOpen, setIsCreateObjectOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('terarobots_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to root and persist
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('terarobots_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('terarobots_theme', 'light');
    }
  }, [isDark]);

  // Load workspace data & analytics
  const refreshData = useCallback(async () => {
    try {
      const meta = await crmApi.getWorkspaceMeta();
      setWorkspace(meta);
      const ana = await crmApi.getAnalyticsSummary();
      setAnalytics(ana);
    } catch (e) {
      console.error('Failed to load workspace data:', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-zinc-950 text-slate-500 font-sans text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          <span>Starting TeraRobots CRM (Rust Engine)...</span>
        </div>
      </div>
    );
  }

  const currentObject = workspace.objects.find((o) => o.id === currentView);
  const objectViews = workspace.views.filter((v) => v.objectId === currentView);

  // Filtered records for current object
  const filteredRecords = workspace.records
    .filter((r) => r.objectId === currentView)
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return Object.values(r.values).some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });

  const handleCreateRecord = async (values: Record<string, any>) => {
    if (!currentObject) return;
    await crmApi.createRecord(currentObject.id, values);
    await refreshData();
  };

  const handleUpdateRecord = async (id: string, values: Record<string, any>) => {
    await crmApi.updateRecord(id, values);
    await refreshData();
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord((prev) => (prev ? { ...prev, values: { ...prev.values, ...values } } : null));
    }
  };

  const handleDeleteRecord = async (id: string) => {
    await crmApi.deleteRecord(id);
    await refreshData();
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleUpdateOpportunityStage = async (id: string, newStage: string) => {
    await crmApi.updateOpportunityStage(id, newStage);
    await refreshData();
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: string) => {
    await crmApi.updateTaskStatus(id, newStatus);
    await refreshData();
  };

  const handleCreateCustomObject = async (meta: Partial<ObjectMetadata>) => {
    const created = await crmApi.createCustomObject(meta);
    await refreshData();
    setCurrentView(created.id);
  };

  const handleExportData = async () => {
    const json = await crmApi.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terarobots-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = async () => {
    if (confirm('Reset workspace database to demo seed data? Any custom items will be restored.')) {
      await crmApi.resetToDemoData();
      await refreshData();
    }
  };

  const handleSelectView = (viewId: string) => {
    if (viewId === 'dashboard' || viewId === 'settings') {
      setCurrentView(viewId);
      return;
    }
    setCurrentView(viewId);
    setSearchQuery('');
    // Default view type
    if (viewId === 'opportunity') {
      setActiveViewType('KANBAN');
    } else {
      setActiveViewType('TABLE');
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-white dark:bg-zinc-950 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        objects={workspace.objects}
        records={workspace.records}
        onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        onOpenCreateObject={() => setIsCreateObjectOpen(true)}
        onExportData={handleExportData}
        onResetData={handleResetData}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {currentView === 'dashboard' ? (
          <DashboardView
            analytics={analytics}
            timeline={workspace.timeline}
            records={workspace.records}
            onSelectRecord={(rec) => {
              setCurrentView(rec.objectId);
              setSelectedRecord(rec);
            }}
            onOpenCreateDeal={() => {
              setCurrentView('opportunity');
              setCreateRecordInitialValues({ stage: 'NEW' });
              setIsCreateRecordOpen(true);
            }}
          />
        ) : currentView === 'settings' ? (
          <SettingsView
            objects={workspace.objects}
            onRefreshWorkspace={refreshData}
            onExportData={handleExportData}
            onResetData={handleResetData}
          />
        ) : (
          <>
            <Header
              currentObject={currentObject}
              activeViewType={activeViewType}
              onToggleViewType={(t) => setActiveViewType(t)}
              views={objectViews}
              activeViewId={activeViewId}
              onSelectView={(vid) => setActiveViewId(vid)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenCreateRecord={() => {
                setCreateRecordInitialValues({});
                setIsCreateRecordOpen(true);
              }}
              onRefresh={refreshData}
              isCustomObject={currentObject?.isCustom}
            />

            {currentObject && activeViewType === 'TABLE' && (
              <TableView
                objectMeta={currentObject}
                records={filteredRecords}
                allRecords={workspace.records}
                allObjects={workspace.objects}
                onSelectRecord={(r) => setSelectedRecord(r)}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
              />
            )}

            {currentObject && activeViewType === 'KANBAN' && (
              <KanbanView
                objectMeta={currentObject}
                records={filteredRecords}
                allRecords={workspace.records}
                onSelectRecord={(r) => setSelectedRecord(r)}
                onUpdateOpportunityStage={handleUpdateOpportunityStage}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onOpenCreateWithStage={(stageVal) => {
                  setCreateRecordInitialValues({ stage: stageVal, status: stageVal });
                  setIsCreateRecordOpen(true);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Record Details Slide-over Drawer */}
      {selectedRecord && (
        <RecordDrawer
          record={selectedRecord}
          objectMeta={
            workspace.objects.find((o) => o.id === selectedRecord.objectId) ||
            workspace.objects[0]
          }
          allObjects={workspace.objects}
          allRecords={workspace.records}
          onClose={() => setSelectedRecord(null)}
          onUpdateRecord={handleUpdateRecord}
        />
      )}

      {/* Create Record Modal */}
      {currentObject && (
        <CreateRecordModal
          isOpen={isCreateRecordOpen}
          onClose={() => setIsCreateRecordOpen(false)}
          objectMeta={currentObject}
          allRecords={workspace.records}
          allObjects={workspace.objects}
          initialValues={createRecordInitialValues}
          onSubmit={handleCreateRecord}
        />
      )}

      {/* Create Custom Object Modal */}
      <CustomObjectModal
        isOpen={isCreateObjectOpen}
        onClose={() => setIsCreateObjectOpen(false)}
        onCreateCustomObject={handleCreateCustomObject}
      />

      {/* Command Menu Modal (Cmd+K) */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        objects={workspace.objects}
        records={workspace.records}
        onSelectView={handleSelectView}
        onSelectRecord={(r) => {
          setCurrentView(r.objectId);
          setSelectedRecord(r);
        }}
        onOpenCreateRecord={(objId) => {
          setCurrentView(objId);
          setIsCreateRecordOpen(true);
        }}
        onExportData={handleExportData}
        onResetData={handleResetData}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />
    </div>
  );
}

export default App;
