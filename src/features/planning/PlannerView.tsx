import React, { useState } from 'react';
import { useSystemStore } from '../../store';
import type { AuditPlan, RescheduleHistory } from '../../types';
import { formatBuddhistDate } from '../../utils/helpers';
import { 
  CalendarDays, 
  Plus, 
  AlertTriangle,
  History,
  Edit,
  CheckCircle,
  ShieldAlert,
  Clock,
  X
} from 'lucide-react';

export const PlannerView: React.FC = () => {
  const { 
    auditPlans, 
    stores, 
    auditors, 
    addAuditPlan, 
    updateAuditPlan, 
    userRole,
    setActiveTab,
    setSelectedPlanId
  } = useSystemStore();

  const CURRENT_YEAR = '2026';
  const CURRENT_DATE_STR = '2026-06-20';

  // Filters state
  const [storeFilter, setStoreFilter] = useState('all');
  const [auditorFilter, setAuditorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AuditPlan | null>(null);

  // Form states
  const [storeId, setStoreId] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [type, setType] = useState<'normal' | 'mystery'>('normal');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Reschedule specific states
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [historyModalPlan, setHistoryModalPlan] = useState<AuditPlan | null>(null);

  // Error/validation messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter entities
  const activeStores = stores.filter(s => s.active);
  const activeAuditors = auditors.filter(a => a.active);

  // Training Gate validator helper
  const checkAuditorEligibility = (auditorIdToCheck: string) => {
    const auditor = auditors.find(a => a.id === auditorIdToCheck);
    if (!auditor) return { ok: false, reason: 'ไม่พบผู้ตรวจนี้ในระบบ' };
    if (!auditor.active) return { ok: false, reason: 'ผู้ตรวจไม่มีสถานะทำงาน (Inactive)' };
    if (!auditor.registered) return { ok: false, reason: 'ผู้ตรวจยังขึ้นทะเบียนไม่สมบูรณ์' };
    if (auditor.trainingStatus !== 'passed') return { ok: false, reason: 'ผู้ตรวจไม่ผ่านการอบรม QSC' };
    if (!auditor.certExpiry) return { ok: false, reason: 'ผู้ตรวจไม่มีใบรับรองอนุญาต' };
    if (auditor.certExpiry < CURRENT_DATE_STR) {
      return { ok: false, reason: 'ใบรับรองความรู้ (Cert) ของผู้ตรวจคนนี้หมดอายุแล้ว' };
    }
    return { ok: true, reason: 'พร้อมปฏิบัติงาน' };
  };

  // Check Annual Coverage for active franchisee stores
  const activeFranchisees = activeStores.filter(s => s.type === 'franchisee');
  const storesWithoutPlan = activeFranchisees.filter(store => {
    // Check if this store has at least one plan scheduled in 2026
    const hasPlanThisYear = auditPlans.some(plan => 
      plan.storeId === store.id && 
      plan.scheduledDate.startsWith(CURRENT_YEAR)
    );
    return !hasPlanThisYear;
  });

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setIsRescheduleMode(false);
    setErrorMsg(null);
    
    // Pick first active store & eligible auditor as defaults
    const defaultStore = activeStores[0]?.id || '';
    
    // Find first auditor who passes the training gate
    const defaultAuditor = activeAuditors.find(a => checkAuditorEligibility(a.id).ok)?.id || '';
    
    setStoreId(defaultStore);
    setAuditorId(defaultAuditor);
    setType('normal');
    setScheduledDate(CURRENT_DATE_STR);
    setRescheduleReason('');
    setIsModalOpen(true);
  };

  const handleOpenRescheduleModal = (plan: AuditPlan) => {
    setEditingPlan(plan);
    setIsRescheduleMode(true);
    setErrorMsg(null);
    setStoreId(plan.storeId);
    setAuditorId(plan.auditorId);
    setType(plan.type);
    setScheduledDate(plan.scheduledDate);
    setRescheduleReason('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validate Store active status
    const targetStore = stores.find(s => s.id === storeId);
    if (!targetStore || !targetStore.active) {
      setErrorMsg('ข้อผิดพลาด: สาขานี้ไม่มีสถานะ Active หรือถูกปิดชั่วคราว');
      return;
    }

    // 2. Validate Auditor eligibility (Training Gate)
    const eligibility = checkAuditorEligibility(auditorId);
    if (!eligibility.ok) {
      setErrorMsg(`ข้อความบล็อกจาก Training Gate: ${eligibility.reason}`);
      return;
    }

    // 3. Validate Conflict of Interest
    const targetAuditor = auditors.find(a => a.id === auditorId);
    if (targetAuditor?.conflictStoreIds.includes(storeId)) {
      setErrorMsg(`ข้อความบล็อกระบบ: ผู้ตรวจ ${targetAuditor.name} มีความสัมพันธ์หรือผลประโยชน์ทับซ้อน (Conflict of Interest) กับสาขานี้ ห้ามมอบหมายสิทธิ์เด็ดขาด`);
      return;
    }

    // Prepare data
    if (isRescheduleMode && editingPlan) {
      // reschedling
      const historyEntry: RescheduleHistory = {
        originalDate: editingPlan.scheduledDate,
        newDate: scheduledDate,
        reason: rescheduleReason || 'ปรับเปลี่ยนตารางการเข้าตรวจหน้างาน',
        updatedAt: new Date().toISOString().split('T')[0]
      };

      const updatedPlan: AuditPlan = {
        ...editingPlan,
        auditorId,
        type,
        scheduledDate,
        status: scheduledDate < CURRENT_DATE_STR && editingPlan.status === 'planned' ? 'due' : editingPlan.status,
        rescheduleHistory: [...editingPlan.rescheduleHistory, historyEntry]
      };

      await updateAuditPlan(updatedPlan);
    } else {
      // creating new plan
      const newPlan: AuditPlan = {
        id: `PL-${Date.now().toString().slice(-4)}`,
        storeId,
        auditorId,
        type,
        scheduledDate,
        status: scheduledDate < CURRENT_DATE_STR ? 'due' : 'planned',
        rescheduleHistory: []
      };

      await addAuditPlan(newPlan);
    }

    setIsModalOpen(false);
  };

  const handleStartAudit = (planId: string) => {
    setSelectedPlanId(planId);
    setActiveTab('audit');
  };

  // Filter plans
  const filteredPlans = auditPlans.filter(plan => {
    const matchesStore = storeFilter === 'all' || plan.storeId === storeFilter;
    const matchesAuditor = auditorFilter === 'all' || plan.auditorId === auditorFilter;
    
    // Status filters (accounting for overdue flag)
    const isOverdue = plan.status === 'planned' && plan.scheduledDate < CURRENT_DATE_STR;
    let matchesStatus = true;
    if (statusFilter === 'all') matchesStatus = true;
    else if (statusFilter === 'overdue') matchesStatus = isOverdue;
    else if (statusFilter === 'planned') matchesStatus = plan.status === 'planned' && !isOverdue;
    else matchesStatus = plan.status === statusFilter;

    return matchesStore && matchesAuditor && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-green flex items-center gap-2">
            <CalendarDays size={28} className="text-brand-gold" />
            แผนการตรวจประเมินรายปี (Annual Audit Planner)
          </h1>
          <p className="text-sm text-gray-500">วางตารางตรวจสอบร้านค้า แฟรนไชส์ ป้องกันการชนกันของผลประโยชน์ และเลื่อนนัดตรวจ</p>
        </div>
        {userRole === 'hq' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-green/10 transition-all duration-200"
          >
            <Plus size={18} />
            <span>สร้างแผนตรวจใหม่</span>
          </button>
        )}
      </div>

      {/* Annual Coverage Warnings */}
      {storesWithoutPlan.length > 0 && (
        <div className="bg-rose-50 border-2 border-brand-red/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 text-brand-dark shadow-sm">
          <div className="flex gap-2 items-start shrink-0">
            <AlertTriangle className="text-brand-red animate-pulse shrink-0" size={24} />
            <div>
              <h4 className="font-extrabold text-brand-red text-sm sm:text-base">แจ้งเตือนสีแดงเชิงรุก: มีสาขาตกหล่นค้างแผน!</h4>
              <p className="text-xs text-gray-500 mt-0.5">แฟรนไชส์ซีต้องได้ตรวจอย่างน้อยปีละ 1 ครั้งตามเกณฑ์ DBD ปี {parseInt(CURRENT_YEAR) + 543}</p>
            </div>
          </div>
          <div className="flex-1 flex flex-wrap gap-1.5">
            {storesWithoutPlan.map(store => (
              <span 
                key={store.id} 
                className="px-2 py-1 bg-brand-red/10 text-brand-red font-bold text-[11px] rounded-lg border border-brand-red/15 hover:bg-brand-red/20 transition-colors"
                title={`${store.name} (ยังไม่มีแผนในปี ${parseInt(CURRENT_YEAR) + 543})`}
              >
                ⚠️ {store.name.replace('วิเชียรซาลาเปา สาขา', '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls Grid */}
      <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Store filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">กรองสาขา</label>
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">ทุกสาขา</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>

        {/* Auditor filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">กรองผู้ตรวจ</label>
          <select
            value={auditorFilter}
            onChange={(e) => setAuditorFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">ผู้ตรวจทุกคน</option>
            {auditors.map(auditor => (
              <option key={auditor.id} value={auditor.id}>{auditor.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">กรองสถานะ</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">ทุกสถานะแผน</option>
            <option value="planned">วางแผนแล้ว (รอนัดตรวจ)</option>
            <option value="overdue">เกินกำหนดตรวจ (Overdue)</option>
            <option value="in_progress">กำลังตรวจอยู่</option>
            <option value="awaiting_rca">รอมอบหมาย RCA</option>
            <option value="awaiting_followup">รอตรวจติดตามผล</option>
            <option value="closed">เสร็จสิ้นสมบูรณ์ (Closed)</option>
          </select>
        </div>
      </div>

      {/* Plan Timeline/Table */}
      <div className="bg-white rounded-2xl border border-brand-green/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-green/5 border-b border-brand-green/10 text-brand-green font-bold text-sm">
                <th className="p-4 w-32">วันนัดตรวจ (พ.ศ.)</th>
                <th className="p-4">ร้านที่รับการตรวจ</th>
                <th className="p-4">ประเภท</th>
                <th className="p-4">ผู้ตรวจหลัก</th>
                <th className="p-4">สถานะแผนงาน</th>
                <th className="p-4 w-44">การดำเนินงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green/5 text-sm text-gray-700">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => {
                  const store = stores.find(s => s.id === plan.storeId);
                  const auditor = auditors.find(a => a.id === plan.auditorId);
                  
                  // Checks for overdue status: status is 'planned' but scheduledDate is less than today (2026-06-20)
                  const isOverdue = plan.status === 'planned' && plan.scheduledDate < CURRENT_DATE_STR;
                  
                  return (
                    <tr key={plan.id} className="hover:bg-brand-cream/10 transition-colors">
                      <td className="p-4 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1">
                          {plan.scheduledDate}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          ({formatBuddhistDate(plan.scheduledDate)})
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-brand-green">{store?.name || 'ไม่พบข้อมูลสาขา'}</div>
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">ID: {plan.storeId}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          plan.type === 'mystery' 
                            ? 'bg-mystery-light text-mystery-purple border border-mystery-purple/20' 
                            : 'bg-brand-green/10 text-brand-green'
                        }`}>
                          {plan.type === 'mystery' ? '🕵️ Mystery Shopper' : '📋 ตรวจปกติ'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-brand-dark">{auditor?.name || 'ไม่พบคู่ตรวจ'}</div>
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">ID: {plan.auditorId}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 w-fit">
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-0.5">
                              <Clock size={11} />
                              เกินกำหนดตรวจ!
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            plan.status === 'closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : plan.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800'
                              : plan.status === 'awaiting_rca'
                              ? 'bg-amber-100 text-amber-800'
                              : plan.status === 'awaiting_followup'
                              ? 'bg-purple-100 text-purple-800 font-semibold'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {plan.status === 'planned' && !isOverdue && 'วางแผนไว้'}
                            {plan.status === 'planned' && isOverdue && 'ค้างดำเนินการ'}
                            {plan.status === 'due' && 'ถึงกำหนด'}
                            {plan.status === 'in_progress' && 'กำลังตรวจ'}
                            {plan.status === 'awaiting_rca' && 'รอส่ง RCA'}
                            {plan.status === 'awaiting_followup' && 'รอตรวจติดตามผล'}
                            {plan.status === 'closed' && 'เสร็จสิ้น'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* Reschedule for HQ */}
                          {userRole === 'hq' && (plan.status === 'planned' || plan.status === 'due') && (
                            <button
                              onClick={() => handleOpenRescheduleModal(plan)}
                              className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg flex items-center gap-1 transition-all"
                            >
                              <Edit size={12} />
                              เลื่อนแผน
                            </button>
                          )}

                          {/* Plan History Modal Trigger */}
                          {plan.rescheduleHistory.length > 0 && (
                            <button
                              onClick={() => setHistoryModalPlan(plan)}
                              className="p-1.5 text-gray-500 hover:text-brand-green hover:bg-brand-green/5 border border-brand-green/10 rounded-lg transition-all"
                              title="ดูประวัติการเลื่อนแผน"
                            >
                              <History size={14} />
                            </button>
                          )}

                          {/* Quick Start Audit for Auditor Role */}
                          {((userRole === 'auditor' && plan.auditorId === useSystemStore.getState().currentUserId) || userRole === 'hq') &&
                            (plan.status === 'planned' || plan.status === 'due' || plan.status === 'in_progress') && (
                            <button
                              onClick={() => handleStartAudit(plan.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 rounded-lg shadow-sm flex items-center gap-1 transition-all"
                            >
                              <CheckCircle size={12} />
                              {plan.status === 'in_progress' ? 'กรอกต่อ' : 'เริ่มตรวจ'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    ไม่พบแผนการเข้าตรวจประเมินตามเงื่อนไขที่กรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Log Modal */}
      {historyModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-brand-green text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-1.5 text-sm sm:text-base">
                <History size={18} />
                ประวัติเลื่อนการเข้าตรวจ {historyModalPlan.id}
              </h3>
              <button 
                onClick={() => setHistoryModalPlan(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 max-h-96 overflow-y-auto space-y-4">
              {historyModalPlan.rescheduleHistory.map((item, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-brand-gold/40 pb-2 last:pb-0">
                  {/* Dot */}
                  <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-gold"></div>
                  
                  <div className="text-xs text-gray-400 font-semibold flex justify-between">
                    <span>วันที่แก้ไข: {formatBuddhistDate(item.updatedAt)}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-700 mt-1">
                    เลื่อนแผนนัด จาก <span className="text-brand-red line-through">{item.originalDate}</span> เป็น <span className="text-emerald-700">{item.newDate}</span>
                  </div>
                  <div className="bg-brand-cream/30 p-2 rounded-lg text-xs text-gray-500 mt-1 border border-brand-green/5 italic">
                    " {item.reason} "
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-brand-green/5 flex justify-end">
              <button
                onClick={() => setHistoryModalPlan(null)}
                className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-400 transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Reschedule Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-brand-green text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-1.5 text-base sm:text-lg">
                <CalendarDays size={20} className="text-brand-gold" />
                {isRescheduleMode ? 'เลื่อนแผนการตรวจประเมิน' : 'สร้างตารางตรวจสาขาใหม่'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="bg-rose-50 border-b border-brand-red/20 px-5 py-3 flex gap-2 text-xs font-bold text-brand-red">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {/* Store Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">เลือกร้านสาขาที่รับตรวจ</label>
                <select
                  required
                  disabled={isRescheduleMode} // Cannot change store when rescheduling
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                >
                  <option value="" disabled>-- เลือกสาขา --</option>
                  {activeStores.map(store => (
                    <option key={store.id} value={store.id}>{store.name} ({store.id})</option>
                  ))}
                </select>
              </div>

              {/* Auditor Selection (Training Gate Gatekeeper) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">เลือกผู้ตรวจหลัก</label>
                <select
                  required
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                >
                  <option value="" disabled>-- เลือกผู้ตรวจ --</option>
                  {activeAuditors.map(auditor => {
                    const eligibility = checkAuditorEligibility(auditor.id);
                    const hasConflict = auditor.conflictStoreIds.includes(storeId);
                    
                    return (
                      <option 
                        key={auditor.id} 
                        value={auditor.id}
                        disabled={!eligibility.ok || hasConflict}
                        className={(!eligibility.ok || hasConflict) ? 'text-gray-300 bg-gray-50' : 'text-brand-dark'}
                      >
                        {auditor.name} ({auditor.id}) 
                        {!eligibility.ok ? ` - ❌ ${eligibility.reason}` : hasConflict ? ' - ⚠️ มีผลประโยชน์ชนสาขา' : ' - ✅ พร้อมปฏิบัติงาน'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Audit Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">รูปแบบการประเมิน (Audit Type)</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 px-3 py-2 border border-brand-green/10 rounded-xl cursor-pointer hover:bg-brand-cream/10 select-none">
                    <input
                      type="radio"
                      name="audit-type"
                      checked={type === 'normal'}
                      onChange={() => setType('normal')}
                      className="text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-xs font-bold text-gray-700">ตรวจเปิดเผย (Normal)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 px-3 py-2 border border-brand-green/10 rounded-xl cursor-pointer hover:bg-brand-cream/10 select-none">
                    <input
                      type="radio"
                      name="audit-type"
                      checked={type === 'mystery'}
                      onChange={() => setType('mystery')}
                      className="text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-xs font-bold text-gray-700">ผู้ตรวจลับ (Mystery)</span>
                  </label>
                </div>
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">วันนัดเข้าตรวจมาตรฐาน</label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              {/* Reschedule Reason (Required only when rescheduling) */}
              {isRescheduleMode && (
                <div className="animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-bold text-brand-red mb-1.5">เหตุผลความจำเป็นในการเลื่อนแผน (Required)</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="เช่น ผู้ตรวจเดิมติดประชุมใหญ่ประจำเดือน หรือสาขาขอเลื่อนเพราะปรับปรุงระบบน้ำประปา"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-red/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                  />
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-green/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green/90 shadow-lg shadow-brand-green/10"
                >
                  {isRescheduleMode ? 'ยืนยันเลื่อนนัด' : 'สร้างแผนงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
