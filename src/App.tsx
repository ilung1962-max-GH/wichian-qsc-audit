import { useEffect } from 'react';
import { useSystemStore } from './store';
import { Layout } from './components/Layout';
import { Mascot } from './components/Mascot';

// Import Views
import { DashboardView } from './features/dashboard/DashboardView';
import { StoresView } from './features/stores/StoresView';
import { AuditorsView } from './features/auditors/AuditorsView';
import { PlannerView } from './features/planning/PlannerView';
import { AuditFlowView } from './features/audit-flow/AuditFlowView';
import { CapaView } from './features/capa/CapaView';

function App() {
  const { loadData, isLoading, activeTab } = useSystemStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center gap-4">
        <Mascot size="lg" animate={true} message="กำลังเปิดระบบ QSC Audit และดึงข้อมูลจากร้านวิเชียร..." />
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-3 h-3 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'stores':
        return <StoresView />;
      case 'auditors':
        return <AuditorsView />;
      case 'planner':
        return <PlannerView />;
      case 'audit':
        return <AuditFlowView />;
      case 'capa':
        return <CapaView />;
      default:
        return <DashboardView />;
    }
  };

  return <Layout>{renderActiveView()}</Layout>;
}

export default App;
