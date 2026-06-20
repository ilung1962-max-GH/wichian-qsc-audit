import React, { useState } from 'react';
import { useSystemStore } from '../../store';
import type { CAPAItem } from '../../types';
import { formatBuddhistDate } from '../../utils/helpers';
import { 
  AlertTriangle, 
  CheckCircle, 
  Camera, 
  Clock,
  ShieldCheck,
  Send,
  Eye,
  X,
  UserX
} from 'lucide-react';

export const CapaView: React.FC = () => {
  const { 
    capaItems, 
    stores, 
    auditors, 
    auditResults, 
    userRole, 
    currentUserId,
    submitRCA,
    verifyCAPA
  } = useSystemStore();

  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'rca_submitted' | 'verified_closed'>('all');
  
  // Modals
  const [rcaModalItem, setRcaModalItem] = useState<CAPAItem | null>(null);
  const [verifyModalItem, setVerifyModalItem] = useState<CAPAItem | null>(null);
  const [detailModalItem, setDetailModalItem] = useState<CAPAItem | null>(null);

  // Form states for RCA
  const [correction, setCorrection] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');

  // Form states for Verify
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpPhoto, setFollowUpPhoto] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const getStoreName = (storeId: string) => {
    return stores.find(s => s.id === storeId)?.name || storeId;
  };

  const getAuditorName = (auditorId: string | null) => {
    if (!auditorId) return '-';
    return auditors.find(a => a.id === auditorId)?.name || auditorId;
  };

  // Filter CAPAs based on role permissions
  const visibleCapas = capaItems.filter(capa => {
    if (userRole === 'franchisee') {
      // Franchisees only see their own store's CAPA
      return capa.storeId === currentUserId;
    }
    // HQ and Auditors see all CAPA
    return true;
  });

  // Filter based on selected sub-tab
  const filteredCapas = visibleCapas.filter(capa => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return capa.status === 'open';
    if (activeTab === 'rca_submitted') return capa.status === 'rca_submitted';
    return capa.status === 'verified_closed';
  });

  // Check if current user is the same auditor who performed the original audit
  const isOriginalAuditor = (capa: CAPAItem) => {
    const originalAudit = auditResults.find(r => r.id === capa.auditId);
    return originalAudit?.auditorId === currentUserId;
  };

  const handleOpenRcaModal = (item: CAPAItem) => {
    setRcaModalItem(item);
    setCorrection(item.rca?.correction || '');
    setRootCause(item.rca?.rootCause || '');
    setPreventiveAction(item.rca?.preventiveAction || '');
  };

  const handleRcaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcaModalItem) return;

    await submitRCA(rcaModalItem.id, {
      correction,
      rootCause,
      preventiveAction
    });

    setRcaModalItem(null);
  };

  const handleOpenVerifyModal = (item: CAPAItem) => {
    setVerifyModalItem(item);
    setFollowUpNotes('');
    setFollowUpPhoto(null);
    setVerifyError(null);
  };

  const handleVerifyPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFollowUpPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalItem) return;

    // Rule Check: Verify auditor must be different from original auditor
    if (isOriginalAuditor(verifyModalItem)) {
      setVerifyError('ข้อผิดพลาดทางธุรกิจ: ผู้ติดตามผลความคืบหน้า (Verify) ห้ามเป็นคนเดียวกับผู้ตรวจประเมินหน้างานรอบแรกเด็ดขาด ระบบได้บล็อกคุณตามกฎ Franchise Standard');
      return;
    }

    if (!followUpPhoto) {
      setVerifyError('กรุณาอัปโหลดรูปถ่ายหลังการแก้ไข (After Photo) เพื่อเป็นหลักฐานปิดงาน');
      return;
    }

    await verifyCAPA(
      verifyModalItem.id,
      currentUserId,
      followUpNotes,
      followUpPhoto
    );

    setVerifyModalItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-green flex items-center gap-2">
          <AlertTriangle size={28} className="text-brand-gold" />
          การจัดการข้อเสนอแนะแก้ไข (CAPA & RCA)
        </h1>
        <p className="text-sm text-gray-500">ติดตามปัญหาที่ตรวจพบ แจ้งรายละเอียดการวิเคราะห์สาเหตุ (RCA 3 ส่วน) และตรวจรับงานแก้ไขโดยผู้ตรวจคนใหม่</p>
      </div>

      {/* Sub-tabs selection */}
      <div className="flex border-b border-brand-green/10">
        {(['all', 'open', 'rca_submitted', 'verified_closed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-brand-green text-brand-green font-extrabold' 
                : 'border-transparent text-gray-400 hover:text-brand-green'
            }`}
          >
            {tab === 'all' && 'ทั้งหมด'}
            {tab === 'open' && 'รอส่ง RCA (Open)'}
            {tab === 'rca_submitted' && 'ตอบ RCA แล้ว (รอติดตาม)'}
            {tab === 'verified_closed' && 'ปิดรายการแล้ว (Closed)'}
          </button>
        ))}
      </div>

      {/* CAPA Items List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCapas.length > 0 ? (
          filteredCapas.map(item => {
            const isOrigAuditor = isOriginalAuditor(item);
            const originalResult = auditResults.find(r => r.id === item.auditId);
            
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-brand-green/10 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-400">{item.id}</span>
                      <span className="text-[10px] text-gray-400">อ้างอิง: <strong>{item.auditId}</strong></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'open' ? 'bg-rose-100 text-brand-red' :
                        item.status === 'rca_submitted' ? 'bg-amber-100 text-brand-dark' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status === 'open' && 'รอตอบ RCA'}
                        {item.status === 'rca_submitted' && 'รอตรวจติดตามผล'}
                        {item.status === 'verified_closed' && 'ปิดรอบเสร็จสิ้น'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-brand-green text-sm sm:text-base">
                        {getStoreName(item.storeId)}
                      </h3>
                      <div className="text-xs text-gray-500 font-bold flex items-center gap-1.5 mt-1">
                        <span>ข้อตรวจ {item.itemId}:</span>
                        <span className="text-brand-dark">{item.questionText}</span>
                      </div>
                    </div>

                    {/* Auditor findings */}
                    <div className="bg-rose-50/50 p-2.5 rounded-xl border border-brand-red/10 text-xs">
                      <span className="font-bold text-brand-red block">บันทึกข้อบกพร่องจากผู้ตรวจ:</span>
                      <span className="text-gray-600 font-medium italic">" {item.notes} "</span>
                      <div className="text-[10px] text-gray-400 mt-1">
                        ผู้ตรวจพบปัญหา: {getAuditorName(originalResult?.auditorId || null)}
                      </div>
                    </div>

                    {/* RCA summary preview if submitted */}
                    {item.rca && (
                      <div className="bg-brand-cream/20 p-2.5 rounded-xl border border-brand-green/10 text-xs">
                        <span className="font-bold text-brand-green block">คำชี้แจง RCA จากสาขา:</span>
                        <div className="text-[11px] text-gray-500 mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span className="font-bold block text-gray-400">แก้ไขเบื้องต้น:</span>
                            <span className="italic">"{item.rca.correction}"</span>
                          </div>
                          <div>
                            <span className="font-bold block text-gray-400">วิเคราะห์รากปัญหา (5 Whys):</span>
                            <span className="italic">"{item.rca.rootCause}"</span>
                          </div>
                          <div>
                            <span className="font-bold block text-gray-400">มาตรการป้องกันซ้ำ:</span>
                            <span className="italic">"{item.rca.preventiveAction}"</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Before Photo */}
                  {item.beforePhoto && (
                    <div className="shrink-0 self-start md:self-auto">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">ภาพตรวจพบความบกพร่อง (Before)</span>
                      <div className="w-24 h-24 border border-brand-red/20 rounded-xl overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center">
                        <img src={item.beforePhoto} alt="before" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {/* After Photo (if closed) */}
                  {item.followUpPhoto && (
                    <div className="shrink-0 self-start md:self-auto">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">ภาพหลังการแก้ไข (After)</span>
                      <div className="w-24 h-24 border border-emerald-200 rounded-xl overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center">
                        <img src={item.followUpPhoto} alt="after" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations area */}
                <div className="pt-3 mt-3 border-t border-brand-green/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[10px] text-gray-400 font-semibold self-start sm:self-auto">
                    {item.status === 'verified_closed' && (
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <ShieldCheck size={12} />
                        ปิดรอบโดยผู้ตรวจ: {getAuditorName(item.followUpAuditorId)} เมื่อ {formatBuddhistDate(item.followUpDate)}
                      </span>
                    )}
                    {item.status === 'rca_submitted' && (
                      <span className="flex items-center gap-0.5 text-brand-gold">
                        <Clock size={12} />
                        รอผู้ตรวจนัดติดตามผล
                      </span>
                    )}
                    {item.status === 'open' && (
                      <span className="flex items-center gap-0.5 text-brand-red">
                        <AlertTriangle size={12} />
                        สาขาแฟรนไชส์ซีค้างระบุรายงานวิเคราะห์ RCA
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto">
                    {/* View Details */}
                    {item.status === 'verified_closed' && (
                      <button
                        onClick={() => setDetailModalItem(item)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Eye size={12} />
                        ดูบันทึกปิดงาน
                      </button>
                    )}

                    {/* Submit RCA (Franchisee Role only) */}
                    {userRole === 'franchisee' && item.status === 'open' && (
                      <button
                        onClick={() => handleOpenRcaModal(item)}
                        className="px-4 py-2 bg-brand-gold text-brand-dark text-xs font-bold rounded-xl shadow hover:bg-brand-gold/90 flex items-center gap-1 transition-all"
                      >
                        <Send size={12} />
                        ระบุวิเคราะห์ RCA
                      </button>
                    )}

                    {/* Verify Follow up (Auditor Role only) */}
                    {(userRole === 'auditor' || userRole === 'hq') && item.status === 'rca_submitted' && (
                      <button
                        onClick={() => handleOpenVerifyModal(item)}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow flex items-center gap-1 transition-all ${
                          isOrigAuditor && userRole === 'auditor'
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20'
                        }`}
                        disabled={isOrigAuditor && userRole === 'auditor'}
                        title={isOrigAuditor && userRole === 'auditor' ? 'คุณเป็นคนตรวจพบปัญหานี้ ห้ามเป็นคน verify ปิดงาน' : ''}
                      >
                        {isOrigAuditor && userRole === 'auditor' ? (
                          <>
                            <UserX size={12} />
                            ติดล็อกผู้ตรวจคนเดิม
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            ตรวจติดตามและปิดงาน
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-brand-green/10 p-12 text-center text-gray-400">
            <CheckCircle size={48} className="mx-auto mb-3 text-gray-300 animate-pulse" />
            <p className="font-medium text-sm">ไม่มีข้อบกพร่อง/ประเด็นปรับปรุง QSC ค้างในสถานะนี้</p>
          </div>
        )}
      </div>

      {/* RCA Submit Modal (Franchisee view) */}
      {rcaModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-brand-green text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-1.5 text-base sm:text-lg">
                <AlertTriangle size={20} className="text-brand-gold" />
                กรอกรายงานวิเคราะห์ RCA 3 ส่วน
              </h2>
              <button 
                onClick={() => setRcaModalItem(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRcaSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-rose-50 p-3 rounded-xl border border-brand-red/10 text-xs text-gray-700">
                <span className="font-bold text-brand-red block">โจทย์ปัญหา:</span>
                <span>{rcaModalItem.questionText}</span>
                <span className="block font-bold text-gray-500 mt-1">รายละเอียดจากผู้ตรวจ: "{rcaModalItem.notes}"</span>
              </div>

              {/* 1. Correction */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  1. การแก้ไขปัญหาทันที (Correction) <span className="text-brand-red">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="เช่น ขัดล้างทำความสะอาดพื้น/อุปกรณ์ คล้องโซ่ล็อกถังแก๊สทันทีที่ได้รับแจ้ง..."
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              {/* 2. Root Cause Analysis */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  2. การวิเคราะห์สาเหตุที่แท้จริง (Root Cause / 5 Whys) <span className="text-brand-red">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="วิเคราะห์ลึกซึ้งทำไมจึงเกิดเหตุนี้ (เช่น ข้ามขั้นตอน -> พนักงานกะใหม่ยังไม่ผ่านอบรม -> คู่มือขาดการระบุ -> ผู้จัดการไม่มีเช็คลิสต์ตรวจปิดร้าน...)"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              {/* 3. Preventive Action */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  3. มาตรการวางระบบป้องกันการเกิดซ้ำ (Preventive Action) <span className="text-brand-red">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="แผนการจัดทำเพื่อป้องกันในอนาคต (เช่น จัดทำใบตรวจเช็คปิดร้านรายวัน ถ่ายรูปรายงานทางไลน์ ปรับปรุงมาตรฐานอบรมพนักงานใหม่...)"
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-green/5">
                <button
                  type="button"
                  onClick={() => setRcaModalItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green/90 shadow-lg shadow-brand-green/10"
                >
                  ส่งข้อมูลแจ้งสำนักงานใหญ่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Follow-up Modal (Auditor view) */}
      {verifyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-brand-green text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-1.5 text-base sm:text-lg">
                <CheckCircle size={20} className="text-brand-gold" />
                ตรวจติดตามและอนุมัติปิด CAPA
              </h2>
              <button 
                onClick={() => setVerifyModalItem(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {verifyError && (
              <div className="bg-rose-50 border-b border-brand-red/20 px-5 py-3 flex gap-2 text-xs font-bold text-brand-red">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-brand-cream/20 p-3 rounded-xl border border-brand-green/10 space-y-2 text-xs text-gray-700">
                <div>
                  <span className="font-bold block text-brand-green">1. ปัญหาต้นเรื่อง:</span>
                  <span>{verifyModalItem.questionText}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-brand-green/5 pt-2 mt-2">
                  <div>
                    <span className="font-bold text-gray-400 block">แก้ไขเบื้องต้น:</span>
                    <span className="italic">"{verifyModalItem.rca?.correction}"</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 block">สาเหตุหลัก:</span>
                    <span className="italic">"{verifyModalItem.rca?.rootCause}"</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 block">การป้องกัน:</span>
                    <span className="italic">"{verifyModalItem.rca?.preventiveAction}"</span>
                  </div>
                </div>
              </div>

              {/* Verify Auditor Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  บันทึกผลการติดตามตรวจซ้ำหน้างาน <span className="text-brand-red">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="กรุณาระบุรายละเอียด เช่น ตรวจสอบหน้าร้านจริงและขัดทำความสะอาดซึ้งนึ่งเงาขึ้นอย่างเห็นได้ชัด หรือ ติดตั้งโซ่ยึดล็อกถังแก๊สเข้ากับเสาปูนผนังอย่างแน่นหนาดีแล้ว..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white"
                />
              </div>

              {/* After Photo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  อัปโหลดรูปถ่ายหลักฐานยืนยันหลังการแก้ไข (After Photo) <span className="text-brand-red">*</span>
                </label>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 border border-brand-green/20 rounded-xl cursor-pointer text-xs font-bold text-brand-green hover:bg-brand-green/5">
                    <Camera size={14} />
                    <span>อัปโหลด After Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVerifyPhotoUpload(file);
                      }}
                    />
                  </label>
                  
                  {followUpPhoto && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} />
                      แนบภาพแล้ว
                    </span>
                  )}
                </div>

                {followUpPhoto && (
                  <div className="mt-3 w-32 h-32 border border-emerald-200 rounded-xl overflow-hidden bg-gray-50">
                    <img src={followUpPhoto} alt="After editing" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-green/5">
                <button
                  type="button"
                  onClick={() => setVerifyModalItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green/90 shadow-lg shadow-brand-green/10"
                >
                  อนุมัติปิดประเด็น
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal (for closed CAPAs) */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-brand-green text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-1.5 text-sm sm:text-base">
                <ShieldCheck size={18} />
                ประวัติปิดประเด็นความบกพร่อง {detailModalItem.id}
              </h3>
              <button 
                onClick={() => setDetailModalItem(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div>
                <span className="text-xs text-gray-400 font-bold block mb-1">สาขาและเกณฑ์ข้อตรวจ</span>
                <span className="font-bold text-brand-green block">{getStoreName(detailModalItem.storeId)}</span>
                <span className="text-xs text-gray-600 block mt-0.5">{detailModalItem.questionText}</span>
              </div>

              {/* Before/After side-by-side images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">ภาพตรวจพบ (Before)</span>
                  <div className="aspect-square border border-brand-red/20 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {detailModalItem.beforePhoto ? (
                      <img src={detailModalItem.beforePhoto} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">ไม่มีรูปหลักฐาน</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">ภาพแก้ไขแล้ว (After)</span>
                  <div className="aspect-square border border-emerald-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {detailModalItem.followUpPhoto ? (
                      <img src={detailModalItem.followUpPhoto} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">ไม่มีรูปหลักฐาน</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Part RCA Details */}
              <div className="bg-brand-cream/35 p-3 rounded-xl border border-brand-green/10 space-y-2 text-xs">
                <span className="font-bold text-brand-green block">รายละเอียดรายงานวิเคราะห์ RCA จากสาขา:</span>
                <div className="space-y-1.5 text-gray-700 font-medium">
                  <div>
                    <span className="font-bold text-gray-400">1. การแก้ไขเบื้องต้น:</span> "{detailModalItem.rca?.correction}"
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">2. รากปัญหา (5 Whys):</span> "{detailModalItem.rca?.rootCause}"
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">3. มาตรการระยะยาว:</span> "{detailModalItem.rca?.preventiveAction}"
                  </div>
                </div>
              </div>

              {/* Verification Notes */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1.5 text-xs text-emerald-800">
                <span className="font-bold block text-emerald-900">บันทึกตรวจติดตามจากผู้ตรวจ:</span>
                <p className="font-medium italic">"{detailModalItem.followUpNotes}"</p>
                <div className="text-[10px] text-emerald-600/80 font-bold mt-1 text-right">
                  ปิดรอบโดย: {getAuditorName(detailModalItem.followUpAuditorId)} เมื่อ {formatBuddhistDate(detailModalItem.followUpDate)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-brand-green/5 flex justify-end">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-400 transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
