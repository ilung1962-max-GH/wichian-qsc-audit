import React, { useState } from 'react';
import { useSystemStore } from '../../store';
import type { Auditor } from '../../types';
import { formatBuddhistDate } from '../../utils/helpers';
import { 
  Plus, 
  Search, 
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  X,
  Edit2,
  Users as UsersIcon
} from 'lucide-react';

export const AuditorsView: React.FC = () => {
  const { auditors, addAuditor, updateAuditor, userRole, stores } = useSystemStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'internal' | 'independent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuditor, setEditingAuditor] = useState<Auditor | null>(null);

  // Form states
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'internal' | 'independent'>('internal');
  const [registered, setRegistered] = useState(true);
  const [trainingStatus, setTrainingStatus] = useState<'passed' | 'failed' | 'none'>('passed');
  const [certExpiry, setCertExpiry] = useState('');
  const [conflictStoreIds, setConflictStoreIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  // Current date for expiry checking
  const CURRENT_DATE_STR = '2026-06-20';

  const checkEligibility = (auditor: Auditor) => {
    if (!auditor.active) return { ok: false, reason: 'สถานะไม่ทำงาน (Inactive)' };
    if (!auditor.registered) return { ok: false, reason: 'ยังขึ้นทะเบียนไม่เสร็จสิ้น' };
    if (auditor.trainingStatus !== 'passed') return { ok: false, reason: 'ยังไม่ผ่านการอบรม' };
    if (!auditor.certExpiry) return { ok: false, reason: 'ไม่มีวันรับรองใบอนุญาต' };
    
    if (auditor.certExpiry < CURRENT_DATE_STR) {
      return { ok: false, reason: `ใบรับรองหมดอายุ (${formatBuddhistDate(auditor.certExpiry)})` };
    }

    return { ok: true, reason: 'ผ่านเกณฑ์ ปฏิบัติงานได้' };
  };

  const openAddModal = () => {
    setEditingAuditor(null);
    setId(`AUD-00${auditors.length + 1}`);
    setName('');
    setType('internal');
    setRegistered(true);
    setTrainingStatus('passed');
    setCertExpiry('2027-12-31');
    setConflictStoreIds([]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (auditor: Auditor) => {
    setEditingAuditor(auditor);
    setId(auditor.id);
    setName(auditor.name);
    setType(auditor.type);
    setRegistered(auditor.registered);
    setTrainingStatus(auditor.trainingStatus);
    setCertExpiry(auditor.certExpiry || '');
    setConflictStoreIds(auditor.conflictStoreIds);
    setActive(auditor.active);
    setIsModalOpen(true);
  };

  const handleConflictToggle = (storeId: string) => {
    if (conflictStoreIds.includes(storeId)) {
      setConflictStoreIds(conflictStoreIds.filter(id => id !== storeId));
    } else {
      setConflictStoreIds([...conflictStoreIds, storeId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auditorData: Auditor = {
      id,
      name,
      type,
      registered,
      trainingStatus,
      certExpiry: certExpiry || null,
      conflictStoreIds,
      active,
      auditCount: editingAuditor ? editingAuditor.auditCount : 0
    };

    if (editingAuditor) {
      await updateAuditor(auditorData);
    } else {
      await addAuditor(auditorData);
    }

    setIsModalOpen(false);
  };

  // Filters logic
  const filteredAuditors = auditors.filter(auditor => {
    const matchesSearch = auditor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          auditor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || auditor.type === typeFilter;
    
    const eligibility = checkEligibility(auditor);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'eligible' && eligibility.ok) ||
                         (statusFilter === 'ineligible' && !eligibility.ok);
                         
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-green flex items-center gap-2">
            <UsersIcon size={28} className="text-brand-gold" />
            ทะเบียนผู้ตรวจประเมิน (Auditor Registry)
          </h1>
          <p className="text-sm text-gray-500">จัดการคุณสมบัติผู้ตรวจ ติดตามสถานะอบรม และเช็คเกณฑ์รับรองงานตรวจ (Training Gate)</p>
        </div>
        {userRole === 'hq' && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-green/10 transition-all duration-200"
          >
            <Plus size={18} />
            <span>ขึ้นทะเบียนผู้ตรวจใหม่</span>
          </button>
        )}
      </div>

      {/* Training Gate Info Alert */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-brand-dark">
        <ShieldAlert className="text-brand-gold shrink-0 mt-0.5" size={20} />
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-brand-green">กฎเหล็ก Training Gate:</span> ผู้ตรวจจะมีสิทธิ์ถูกมอบหมายงานได้ต่อเมื่อ (1) ผ่านการอบรม (2) ใบรับรอง cert ไม่หมดอายุ และ (3) สถานะ Active เท่านั้น หากขาดข้อใดข้อหนึ่งระบบจะบล็อกและไม่สามารถจัดส่งแผนตรวจได้
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ตรวจ หรือรหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brand-green/10 rounded-xl bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">ผู้ตรวจทุกประเภท</option>
            <option value="internal">เจ้าหน้าที่ซอร์ (Internal)</option>
            <option value="independent">ผู้ตรวจอิสระ (Independent)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">สถานะปฏิบัติงานทั้งหมด</option>
            <option value="eligible">พร้อมทำงาน (ผ่านเกณฑ์)</option>
            <option value="ineligible">ติดล็อก/ห้ามมอบหมายงาน</option>
          </select>
        </div>
      </div>

      {/* Auditor Table / Cards List */}
      <div className="bg-white rounded-2xl border border-brand-green/5 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-green/5 border-b border-brand-green/10 text-brand-green font-bold text-sm">
                <th className="p-4 w-24">รหัส</th>
                <th className="p-4">ผู้ตรวจ</th>
                <th className="p-4">สังกัด</th>
                <th className="p-4">สถานะอบรม</th>
                <th className="p-4">วันหมดอายุ cert</th>
                <th className="p-4">ประเมินสิทธิ์การตรวจ</th>
                <th className="p-4 text-center">ตรวจแล้ว (ครั้ง)</th>
                {userRole === 'hq' && <th className="p-4 w-20">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green/5 text-sm text-gray-700">
              {filteredAuditors.length > 0 ? (
                filteredAuditors.map((auditor) => {
                  const eligibility = checkEligibility(auditor);
                  return (
                    <tr key={auditor.id} className="hover:bg-brand-cream/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-500">{auditor.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-brand-green">{auditor.name}</div>
                        {auditor.conflictStoreIds.length > 0 && (
                          <div className="text-[10px] text-brand-red font-semibold bg-brand-red/5 px-2 py-0.5 rounded-full inline-block mt-1">
                            Conflict: {auditor.conflictStoreIds.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          auditor.type === 'internal' 
                            ? 'bg-brand-green/10 text-brand-green' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {auditor.type === 'internal' ? 'เจ้าหน้าที่ซอร์' : 'ผู้ตรวจอิสระ'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          auditor.trainingStatus === 'passed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : auditor.trainingStatus === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {auditor.trainingStatus === 'passed' 
                            ? 'ผ่านอบรม' 
                            : auditor.trainingStatus === 'failed'
                            ? 'ไม่ผ่านอบรม'
                            : 'ไม่มีประวัติ'}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {auditor.certExpiry ? (
                          <span className={auditor.certExpiry < CURRENT_DATE_STR ? 'text-brand-red font-bold' : ''}>
                            {formatBuddhistDate(auditor.certExpiry)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {eligibility.ok ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-xl w-fit">
                            <CheckCircle2 size={14} />
                            {eligibility.reason}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-brand-red font-bold text-xs bg-brand-red/5 px-2 py-1 rounded-xl w-fit" title={eligibility.reason}>
                            <AlertCircle size={14} className="shrink-0" />
                            {eligibility.reason.length > 25 ? `${eligibility.reason.substring(0, 22)}...` : eligibility.reason}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-brand-dark">
                        {auditor.auditCount || 0}
                      </td>
                      {userRole === 'hq' && (
                        <td className="p-4">
                          <button
                            onClick={() => openEditModal(auditor)}
                            className="p-1.5 text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-all"
                            title="แก้ไขข้อมูลผู้ตรวจ"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลผู้ตรวจที่ตรงตามเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block md:hidden divide-y divide-brand-green/5">
          {filteredAuditors.length > 0 ? (
            filteredAuditors.map((auditor) => {
              const eligibility = checkEligibility(auditor);
              return (
                <div key={auditor.id} className="p-4 hover:bg-brand-cream/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-gray-400">{auditor.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      auditor.type === 'internal' 
                        ? 'bg-brand-green/10 text-brand-green' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {auditor.type === 'internal' ? 'เจ้าหน้าที่ซอร์' : 'ผู้ตรวจอิสระ'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-brand-green text-sm">{auditor.name}</h3>
                    {auditor.conflictStoreIds.length > 0 && (
                      <p className="text-[10px] text-brand-red font-semibold bg-brand-red/5 px-2 py-0.5 rounded-full inline-block mt-1">
                        Conflict: {auditor.conflictStoreIds.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-brand-green/5 text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-[10px]">สถานะการอบรม</span>
                      <span className={`font-semibold inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] ${
                        auditor.trainingStatus === 'passed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {auditor.trainingStatus === 'passed' ? 'ผ่านอบรม' : 'ไม่ผ่านอบรม'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">วันหมดอายุ cert</span>
                      <span className={`font-semibold block mt-1 ${auditor.certExpiry && auditor.certExpiry < CURRENT_DATE_STR ? 'text-brand-red font-bold' : ''}`}>
                        {auditor.certExpiry ? formatBuddhistDate(auditor.certExpiry) : '-'}
                      </span>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="text-gray-400 block text-[10px] mb-1">ผลประเมิน Training Gate</span>
                      {eligibility.ok ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded w-fit">
                          <CheckCircle2 size={12} />
                          {eligibility.reason}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-brand-red font-bold text-[10px] bg-brand-red/5 px-2 py-0.5 rounded w-fit">
                          <AlertCircle size={12} className="shrink-0" />
                          {eligibility.reason}
                        </span>
                      )}
                    </div>
                  </div>

                  {userRole === 'hq' && (
                    <div className="flex justify-between items-center pt-2 border-t border-brand-green/5">
                      <span className="text-[10px] text-gray-400 font-medium">ตรวจแล้ว {auditor.auditCount || 0} ครั้ง</span>
                      <button
                        onClick={() => openEditModal(auditor)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-green bg-brand-green/5 rounded-lg font-semibold hover:bg-brand-green/10"
                      >
                        <Edit2 size={12} />
                        แก้ไขข้อมูล
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              ไม่พบข้อมูลผู้ตรวจที่ระบุ
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Auditor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-green text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-1.5 text-lg">
                <UsersIcon size={20} className="text-brand-gold" />
                {editingAuditor ? 'แก้ไขข้อมูลผู้ตรวจ' : 'ขึ้นทะเบียนผู้ตรวจใหม่'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* ID */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">รหัสผู้ตรวจ</label>
                  <input
                    type="text"
                    required
                    disabled={editingAuditor !== null}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">สังกัดผู้ตรวจ</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  >
                    <option value="internal">เจ้าหน้าที่ซอร์ (Internal)</option>
                    <option value="independent">ผู้ตรวจอิสระ (Independent)</option>
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">ชื่อ-นามสกุล ผู้ตรวจ</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Training Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">สถานะการฝึกอบรม</label>
                  <select
                    value={trainingStatus}
                    onChange={(e) => setTrainingStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  >
                    <option value="passed">ผ่านการอบรมหลักสูตร QSC</option>
                    <option value="failed">ยังสอบไม่ผ่านเกณฑ์</option>
                    <option value="none">ไม่มีข้อมูลการอบรม</option>
                  </select>
                </div>

                {/* Cert Expiry */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">วันหมดอายุใบรับรอง (Cert Expiry)</label>
                  <input
                    type="date"
                    value={certExpiry}
                    onChange={(e) => setCertExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
              </div>

              {/* Conflict Store Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex justify-between">
                  <span>ร้านที่มีผลประโยชน์ทับซ้อน (Conflict of Interest)</span>
                  <span className="text-[10px] text-gray-400 font-normal">ห้ามผู้ตรวจคนนี้ไปตรวจที่นี่</span>
                </label>
                <div className="border border-brand-green/10 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 bg-brand-cream/10">
                  {stores.filter(s => s.active).map(store => {
                    const isConflicting = conflictStoreIds.includes(store.id);
                    return (
                      <label key={store.id} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isConflicting}
                          onChange={() => handleConflictToggle(store.id)}
                          className="w-3.5 h-3.5 rounded text-brand-green focus:ring-brand-green"
                        />
                        <span className="text-xs text-gray-700">{store.name} ({store.id})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active & Registered checkboxes */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active-auditor"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
                  />
                  <label htmlFor="active-auditor" className="text-sm font-semibold text-gray-700 cursor-pointer">Active (พร้อมทำงาน)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="registered-auditor"
                    checked={registered}
                    onChange={(e) => setRegistered(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
                  />
                  <label htmlFor="registered-auditor" className="text-sm font-semibold text-gray-700 cursor-pointer">ขึ้นทะเบียนสมบูรณ์</label>
                </div>
              </div>

              {/* Actions */}
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
                  {editingAuditor ? 'บันทึกการแก้ไข' : 'ขึ้นทะเบียนผู้ตรวจ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
