import React, { useState } from 'react';
import { useSystemStore } from '../store';
import type { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CalendarDays, 
  ClipboardCheck, 
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    userRole, 
    setRole, 
    activeTab, 
    setActiveTab, 
    stores, 
    currentUserId, 
    setCurrentUserId 
  } = useSystemStore();
  
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Filter stores that are active for the Franchisee dropdown selection
  const activeStores = stores.filter(s => s.active);

  // Tab configurations
  const allTabs = [
    { id: 'dashboard', name: 'แดชบอร์ด', icon: LayoutDashboard, roles: ['hq', 'auditor', 'franchisee'] },
    { id: 'stores', name: 'ทะเบียนสาขา', icon: Store, roles: ['hq'] },
    { id: 'auditors', name: 'ทะเบียนผู้ตรวจ', icon: Users, roles: ['hq'] },
    { id: 'planner', name: 'แผนการตรวจ', icon: CalendarDays, roles: ['hq', 'auditor'] },
    { id: 'audit', name: 'ตรวจหน้างาน', icon: ClipboardCheck, roles: ['hq', 'auditor'] },
    { id: 'capa', name: 'จัดการ CAPA / RCA', icon: AlertTriangle, roles: ['hq', 'auditor', 'franchisee'] },
  ];

  // Filter tabs based on current role
  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole));

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setIsRoleDropdownOpen(false);
    
    // Automatically reset tab to dashboard if the new role doesn't support the current tab
    const supportedTabs = allTabs.filter(t => t.roles.includes(role)).map(t => t.id);
    if (!supportedTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'hq': return 'ผู้จัดการแฟรนไชส์ (HQ)';
      case 'auditor': return 'ผู้ตรวจประเมิน (Auditor)';
      case 'franchisee': return 'แฟรนไชส์ซี (Franchisee)';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-brand-green text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            className="lg:hidden p-1 rounded-lg hover:bg-brand-green/80 transition-colors"
          >
            {isSidebarOpenMobile ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Logo icon */}
          <div className="w-[72px] h-[72px] bg-white rounded-xl p-1 flex items-center justify-center shadow-inner">
            <img src="/logo-icon.svg" alt="Wichian Mascot" className="w-full h-full" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight tracking-wide">วิเชียรซาลาเปา</span>
            <span className="text-[10px] text-brand-pink font-medium">Smart QSC Audit System</span>
          </div>
        </div>

        {/* Right side: Role Switcher & User Selection */}
        <div className="flex items-center gap-2">
          {/* Franchisee Specific Store Selector */}
          {userRole === 'franchisee' && (
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1 max-w-[120px] sm:max-w-none focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {activeStores.map(store => (
                <option key={store.id} value={store.id} className="text-brand-dark">
                  {store.name.replace('วิเชียรซาลาเปา สาขา', '')}
                </option>
              ))}
            </select>
          )}

          {/* Auditor Specific Selector */}
          {userRole === 'auditor' && (
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1 max-w-[120px] sm:max-w-none focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="AUD-001" className="text-brand-dark">สมชาย ตรวจดี</option>
              <option value="AUD-002" className="text-brand-dark">สมศรี ขยันตรวจ (มี conflict)</option>
              <option value="AUD-005" className="text-brand-dark">จารุวรรณ ตาดี</option>
            </select>
          )}

          {/* Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark font-semibold text-xs sm:text-sm rounded-lg shadow transition-all duration-200"
            >
              <UserCheck size={16} />
              <span className="hidden sm:inline">{getRoleLabel(userRole)}</span>
              <span className="sm:hidden">{userRole.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>

            {isRoleDropdownOpen && (
              <>
                {/* Backdrop to close */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-brand-dark shadow-xl border border-brand-green/15 z-40 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    สลับบทบาทเดโม (Select Role)
                  </div>
                  <button
                    onClick={() => handleRoleChange('hq')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-brand-cream ${userRole === 'hq' ? 'font-bold text-brand-green bg-brand-green/5' : ''}`}
                  >
                    👑 {getRoleLabel('hq')}
                  </button>
                  <button
                    onClick={() => handleRoleChange('auditor')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-brand-cream ${userRole === 'auditor' ? 'font-bold text-brand-green bg-brand-green/5' : ''}`}
                  >
                    🔍 {getRoleLabel('auditor')}
                  </button>
                  <button
                    onClick={() => handleRoleChange('franchisee')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-brand-cream ${userRole === 'franchisee' ? 'font-bold text-brand-green bg-brand-green/5' : ''}`}
                  >
                    🏪 {getRoleLabel('franchisee')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex relative">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-brand-green/10 p-4 shrink-0 shadow-sm">
          {/* Brand header */}
          <div className="mb-4 p-2 flex flex-col items-center border-b border-brand-green/5">
            <img src="/logo-wichian.svg" alt="วิเชียรซาลาเปา" className="h-[95px] object-contain mb-2" />
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-green/10 text-brand-green mt-1">
              {userRole === 'hq' ? 'HEADQUARTERS' : userRole === 'auditor' ? 'AUDITOR APP' : 'FRANCHISEE PORTAL'}
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-green text-white shadow-md shadow-brand-green/20' 
                      : 'text-gray-600 hover:bg-brand-cream hover:text-brand-green'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-brand-gold' : 'text-gray-400'} />
                  {tab.name}
                </button>
              );
            })}
          </nav>

          {/* Footer branding */}
          <div className="text-[10px] text-gray-400 text-center mt-auto pt-4 border-t border-brand-green/5 space-y-2">
            <button
              onClick={async () => {
                if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดเป็นค่าตั้งต้นใช่หรือไม่? ข้อมูลการแก้ไขและการตรวจใหม่จะถูกล้างออกทั้งหมด')) {
                  await useSystemStore.getState().resetDatabase();
                  alert('รีเซ็ตข้อมูลระบบเป็นค่าตั้งต้นเรียบร้อยแล้ว!');
                }
              }}
              className="w-full py-1 px-2 border border-brand-red/35 hover:bg-brand-red/10 text-brand-red font-bold rounded-lg transition-all"
            >
              🔄 รีเซ็ตข้อมูลจำลองระบบ
            </button>
            <div>
              มาตรฐานการปฏิบัติการ DBD 2569<br />
              เวอร์ชัน 1.0.0 (Demo Mode)
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Slide-out */}
        {isSidebarOpenMobile && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpenMobile(false)}
            />
            
            <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 lg:hidden">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-brand-green/10">
                <span className="font-bold text-brand-green">เมนูระบบ</span>
                <button 
                  onClick={() => setIsSidebarOpenMobile(false)}
                  className="p-1 rounded hover:bg-brand-cream text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 flex flex-col items-center">
                <img src="/logo-wichian.svg" alt="วิเชียรซาลาเปา" className="h-20 object-contain mb-1" />
                <span className="text-xs text-brand-gold font-bold bg-brand-green/5 px-2 py-0.5 rounded">
                  {getRoleLabel(userRole)}
                </span>
              </div>

              <nav className="space-y-1">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsSidebarOpenMobile(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-brand-green text-white shadow' 
                          : 'text-gray-600 hover:bg-brand-cream hover:text-brand-green'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-brand-gold' : 'text-gray-400'} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
              
              <div className="text-[10px] text-gray-400 text-center mt-auto pt-4 border-t border-brand-green/5 space-y-2">
                <button
                  onClick={async () => {
                    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดเป็นค่าตั้งต้นใช่หรือไม่? ข้อมูลการแก้ไขและการตรวจใหม่จะถูกล้างออกทั้งหมด')) {
                      await useSystemStore.getState().resetDatabase();
                      alert('รีเซ็ตข้อมูลระบบเป็นค่าตั้งต้นเรียบร้อยแล้ว!');
                      setIsSidebarOpenMobile(false);
                    }
                  }}
                  className="w-full py-1 px-2 border border-brand-red/35 hover:bg-brand-red/10 text-brand-red font-bold rounded-lg transition-all"
                >
                  🔄 รีเซ็ตข้อมูลจำลอง
                </button>
                <div>
                  มาตรฐาน DBD 2569 · ภาษาไทย 100%
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Page Content Panel */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-full pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile / Tablet (< lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-green/10 flex items-center justify-around py-2 z-30 shadow-lg">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center w-16 py-1 text-center"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-green text-brand-gold scale-110 shadow-sm' 
                  : 'text-gray-400 hover:text-brand-green'
              }`}>
                <Icon size={20} />
              </div>
              <span className={`text-[9px] font-bold mt-1 ${
                isActive ? 'text-brand-green font-extrabold' : 'text-gray-500'
              }`}>
                {tab.name.split(' ')[0]} {/* Grab first word like "แดชบอร์ด" or "จัดการ" */}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
