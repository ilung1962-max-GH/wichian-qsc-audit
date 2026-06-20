import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../../store';
import type { AuditPlan, AuditResult, AuditCategory, AuditItem, CAPAItem } from '../../types';
import { calculateAuditScore, formatBuddhistDate } from '../../utils/helpers';
import { getNormalChecklist, getMysteryChecklist } from '../../db/seedData';
import { 
  ClipboardCheck, 
  Store, 
  User, 
  Calendar,
  AlertTriangle,
  Camera,
  Check,
  Save,
  Send,
  ArrowLeft,
  XCircle,
  Printer
} from 'lucide-react';

export const AuditFlowView: React.FC = () => {
  const { 
    auditPlans, 
    stores, 
    auditors, 
    submitAuditResult, 
    userRole,
    selectedPlanId,
    setSelectedPlanId
  } = useSystemStore();

  const CURRENT_DATE_STR = '2026-06-20';

  // Active plan being audited
  const [activePlan, setActivePlan] = useState<AuditPlan | null>(null);
  const [auditDate, setAuditDate] = useState(CURRENT_DATE_STR);
  
  // Checklist state
  const [categories, setCategories] = useState<AuditCategory[]>([]);
  const [liveScore, setLiveScore] = useState(0);
  const [liveGrade, setLiveGrade] = useState<'A' | 'B' | 'C' | 'D'>('D');
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  // Print Preview state
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewResult, setPreviewResult] = useState<AuditResult | null>(null);

  // Sync selectedPlanId from global store (e.g. from Planner Tab click)
  useEffect(() => {
    if (selectedPlanId) {
      const plan = auditPlans.find(p => p.id === selectedPlanId);
      if (plan) {
        handleSelectPlan(plan);
      }
    }
  }, [selectedPlanId, auditPlans]);

  const handleSelectPlan = async (plan: AuditPlan) => {
    setActivePlan(plan);
    setAuditDate(CURRENT_DATE_STR);
    setShowValidation(false);
    setValidationErrors([]);

    // Check if there is an in-progress audit result in the global store / DB
    const existingResult = useSystemStore.getState().auditResults.find(r => r.planId === plan.id);
    
    if (existingResult && existingResult.status === 'in_progress') {
      // Resume from in-progress result
      setCategories(existingResult.categories);
      const { score, grade } = calculateAuditScore(existingResult.categories);
      setLiveScore(score);
      setLiveGrade(grade);
    } else {
      // Initialize new checklist based on type
      const checklist = plan.type === 'mystery' ? getMysteryChecklist() : getNormalChecklist();
      setCategories(checklist);
      const { score, grade } = calculateAuditScore(checklist);
      setLiveScore(score);
      setLiveGrade(grade);
    }
  };

  // Recalculate score whenever checklist items change
  const handleItemStatusChange = (catId: string, itemId: string, status: AuditItem['status']) => {
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          
          // Clear notes and photo if status changed to pass or na
          const isFailOrImprove = status === 'fail' || status === 'improve';
          return {
            ...item,
            status,
            notes: isFailOrImprove ? item.notes : '',
            photo: isFailOrImprove ? item.photo : null
          };
        })
      };
    });

    setCategories(updated);
    const { score, grade } = calculateAuditScore(updated);
    setLiveScore(score);
    setLiveGrade(grade);
  };

  const handleItemTextChange = (catId: string, itemId: string, notes: string) => {
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, notes };
        })
      };
    });
    setCategories(updated);
  };

  const handlePhotoUpload = (catId: string, itemId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updated = categories.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, photo: base64 };
          })
        };
      });
      setCategories(updated);
    };
    reader.readAsDataURL(file);
  };

  // Run validation
  const validateForm = (): boolean => {
    const errors: string[] = [];

    categories.forEach(cat => {
      cat.items.forEach(item => {
        // 1. Check if answered
        if (item.status === null) {
          errors.push(`ข้อ ${item.id}: ยังไม่ได้ให้คะแนนประเมิน`);
          return;
        }

        // 2. Check if fail/improve requires notes
        if ((item.status === 'fail' || item.status === 'improve') && !item.notes.trim()) {
          errors.push(`ข้อ ${item.id}: บังคับระบุข้อเสนอแนะในการปรับปรุง`);
        }

        // 3. Check if fail/improve requires photo
        if ((item.status === 'fail' || item.status === 'improve') && item.requiresPhotoOnFail && !item.photo) {
          errors.push(`ข้อ ${item.id}: บังคับแนบรูปถ่ายหลักฐานความบกพร่อง`);
        }
      });
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Trigger validation effect
  useEffect(() => {
    if (showValidation) {
      validateForm();
    }
  }, [categories, showValidation]);

  const handleSaveDraft = async () => {
    if (!activePlan) return;

    // Create temporary audit result as in-progress
    const result: AuditResult = {
      id: activePlan.id,
      planId: activePlan.id,
      storeId: activePlan.storeId,
      auditorId: activePlan.auditorId,
      type: activePlan.type,
      auditDate,
      categories,
      score: liveScore,
      grade: liveGrade,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Submit draft (Dexie DB holds status 'in_progress')
    await submitAuditResult(result, []);
    
    // Reset and return
    setActivePlan(null);
    setSelectedPlanId(null);
  };

  const handleSubmitResult = async () => {
    setShowValidation(true);
    const isValid = validateForm();
    if (!isValid || !activePlan) return;

    // Determine target status: if there are failed/improved items, status becomes awaiting_rca, else closed
    const hasFailures = categories.some(cat => 
      cat.items.some(item => item.status === 'fail' || item.status === 'improve')
    );
    const finalStatus = hasFailures ? 'awaiting_rca' : 'closed';

    const result: AuditResult = {
      id: activePlan.id,
      planId: activePlan.id,
      storeId: activePlan.storeId,
      auditorId: activePlan.auditorId,
      type: activePlan.type,
      auditDate,
      categories,
      score: liveScore,
      grade: liveGrade,
      status: finalStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Extract failed items and build CAPA items
    const capaItems: CAPAItem[] = [];
    if (hasFailures) {
      let capaCounter = 1;
      categories.forEach(cat => {
        cat.items.forEach(item => {
          if (item.status === 'fail' || item.status === 'improve') {
            capaItems.push({
              id: `CAPA-${activePlan.id.slice(-3)}-0${capaCounter++}`,
              auditId: activePlan.id,
              storeId: activePlan.storeId,
              itemId: item.id,
              questionText: item.questionText,
              notes: item.notes,
              beforePhoto: item.photo,
              rca: null,
              status: 'open',
              followUpAuditorId: null,
              followUpDate: null,
              followUpPhoto: null,
              followUpNotes: null
            });
          }
        });
      });
    }

    // Submit to store/database
    await submitAuditResult(result, capaItems);

    // Set preview result to trigger PDF/Print screen
    setPreviewResult(result);
    setShowPrintPreview(true);
  };

  const handleClosePrintPreview = () => {
    setShowPrintPreview(false);
    setPreviewResult(null);
    setActivePlan(null);
    setSelectedPlanId(null);
  };

  // Get active plans list
  const pendingPlans = auditPlans.filter(p => 
    p.status === 'planned' || p.status === 'due' || p.status === 'in_progress'
  );

  // Filter plans based on logged in auditor role
  const visiblePlans = pendingPlans.filter(plan => {
    if (userRole === 'hq') return true;
    // Auditor role only sees plans assigned to them
    return plan.auditorId === useSystemStore.getState().currentUserId;
  });

  if (showPrintPreview && previewResult) {
    const store = stores.find(s => s.id === previewResult.storeId);
    const auditor = auditors.find(a => a.id === previewResult.auditorId);
    
    return (
      <div className="bg-white p-6 rounded-2xl border border-brand-green/10 shadow-lg max-w-4xl mx-auto space-y-6 print:p-0 print:border-none print:shadow-none animate-in fade-in duration-300">
        
        {/* Actions header for screen only */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 print:hidden">
          <button
            onClick={handleClosePrintPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft size={16} />
            <span>เสร็จสิ้นและย้อนกลับ</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-green/90 shadow-md shadow-brand-green/20"
          >
            <Printer size={16} />
            <span>พิมพ์รายงานเป็น PDF</span>
          </button>
        </div>

        {/* Print-ready Report Area */}
        <div id="print-area" className="space-y-6">
          
          {/* Header Brand */}
          <div className="flex items-center justify-between border-b-2 border-brand-green pb-4">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.svg" alt="logo" className="w-14 h-14" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-brand-green">รายงานการเข้าตรวจประเมินมาตรฐาน QSC</h1>
                <p className="text-xs text-gray-500 font-bold">วิเชียรซาลาเปา · นึ่งร้อนใหม่ทุกวัน · อร่อยทุกคำ</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-400 font-bold">เลขที่รายงาน</div>
              <div className="font-mono font-bold text-brand-green text-base">{previewResult.id}</div>
            </div>
          </div>

          {/* Audit Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-brand-cream/20 p-4 rounded-xl border border-brand-green/10 text-xs sm:text-sm">
            <div>
              <span className="text-gray-400 font-bold block">สาขาที่ตรวจประเมิน</span>
              <span className="font-bold text-brand-green">{store?.name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">ผู้ตรวจประเมิน</span>
              <span className="font-bold text-brand-green">{auditor?.name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">วันที่เข้าตรวจจริง</span>
              <span className="font-bold">{formatBuddhistDate(previewResult.auditDate)}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">ประเภทการตรวจ</span>
              <span className="font-bold">
                {previewResult.type === 'mystery' ? '🕵️ Mystery Shopper' : '📋 ตรวจมาตรฐานปกติ'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">คะแนนสรุปถ่วงน้ำหนัก</span>
              <span className="font-extrabold text-brand-gold text-lg">{previewResult.score} / 100</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block">เกรดประเมิน</span>
              <span className={`font-extrabold text-lg ${
                previewResult.grade === 'A' ? 'text-emerald-600' :
                previewResult.grade === 'B' ? 'text-brand-green' :
                previewResult.grade === 'C' ? 'text-brand-gold' : 'text-brand-red'
              }`}>
                เกรด {previewResult.grade} 
                <span className="text-xs font-normal text-gray-400 ml-1">
                  ({previewResult.score >= 80 ? 'ผ่านเกณฑ์มาตรฐาน' : 'ต่ำกว่าเกณฑ์มาตรฐาน'})
                </span>
              </span>
            </div>
          </div>

          {/* Detailed Item List */}
          <div className="space-y-4">
            <h3 className="font-bold text-brand-green border-b border-brand-green/10 pb-1 text-sm sm:text-base">
              รายละเอียดผลคะแนนรายข้อตรวจ (Checklist Breakdown)
            </h3>
            
            <div className="space-y-4">
              {previewResult.categories.map(cat => (
                <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-brand-green/5 px-3 py-2 text-xs sm:text-sm font-bold text-brand-green flex justify-between">
                    <span>{cat.name}</span>
                    <span>น้ำหนัก {cat.weight * 100}%</span>
                  </div>
                  
                  <div className="divide-y divide-gray-50 text-xs sm:text-sm">
                    {cat.items.map(item => (
                      <div key={item.id} className="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-700 flex items-start gap-1">
                            <span className="font-mono text-gray-400 shrink-0">{item.id}</span>
                            <span>{item.questionText}</span>
                          </div>
                          {item.notes && (
                            <div className="text-xs text-brand-red font-medium pl-6">
                              **ข้อสังเกต:** {item.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                          {item.photo && (
                            <img src={item.photo} alt="deficiency" className="w-10 h-10 object-cover rounded border border-gray-200 print:w-16 print:h-16" />
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            item.status === 'pass' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'improve' ? 'bg-amber-100 text-amber-800' :
                            item.status === 'fail' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.status === 'pass' ? 'ผ่าน' :
                             item.status === 'improve' ? 'ต้องแก้ไข' :
                             item.status === 'fail' ? 'ไม่ผ่าน' : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Area */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs sm:text-sm">
            <div className="border-t border-dashed border-gray-400 pt-3">
              <div className="h-10"></div>
              <p className="font-semibold text-gray-700">ลงชื่อ ______________________________</p>
              <p className="text-gray-400 mt-1">ผู้ตรวจประเมินมาตรฐาน ({auditor?.name})</p>
            </div>
            
            <div className="border-t border-dashed border-gray-400 pt-3">
              <div className="h-10"></div>
              <p className="font-semibold text-gray-700">ลงชื่อ ______________________________</p>
              <p className="text-gray-400 mt-1">ผู้จัดการสาขา / แฟรนไชส์ซีรับทราบผล</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. SELECT PLAN STATE */}
      {!activePlan ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h1 className="text-2xl font-bold text-brand-green flex items-center gap-2">
              <ClipboardCheck size={28} className="text-brand-gold" />
              การเข้าประเมินร้านหน้างาน (Conduct Audit)
            </h1>
            <p className="text-sm text-gray-500">เลือกแผนงานที่ได้รับมอบหมายเพื่อเริ่มเข้าตรวจสอบมาตรฐาน QSC (บันทึกออฟไลน์ในเครื่องได้)</p>
          </div>

          {visiblePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePlans.map((plan) => {
                const store = stores.find(s => s.id === plan.storeId);
                const auditor = auditors.find(a => a.id === plan.auditorId);
                const isOverdue = plan.status === 'planned' && plan.scheduledDate < CURRENT_DATE_STR;
                
                return (
                  <div key={plan.id} className="bg-white rounded-2xl border border-brand-green/10 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-400">{plan.id}</span>
                        <div className="flex gap-1.5">
                          {isOverdue && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-lg border border-rose-200">Overdue</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.type === 'mystery' ? 'bg-mystery-light text-mystery-purple border border-mystery-purple/10' : 'bg-brand-green/10 text-brand-green'
                          }`}>
                            {plan.type === 'mystery' ? 'Mystery' : 'ตรวจปกติ'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-brand-green text-sm flex items-center gap-1">
                          <Store size={16} className="text-brand-gold shrink-0" />
                          {store?.name}
                        </h3>
                        <p className="text-xs text-gray-400 pl-5 truncate mt-0.5">{store?.address}</p>
                      </div>

                      <div className="text-xs text-gray-600 pl-5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          <span>ผู้ตรวจ: <strong>{auditor?.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>กำหนดตรวจ: {formatBuddhistDate(plan.scheduledDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-brand-green/5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">
                        {plan.status === 'in_progress' ? '💾 มีร่างบันทึกค้างไว้' : '⏳ รอเริ่มประเมิน'}
                      </span>
                      
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                          plan.status === 'in_progress' 
                            ? 'bg-brand-gold text-brand-dark hover:bg-brand-gold/90 shadow-brand-gold/25' 
                            : 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20'
                        }`}
                      >
                        {plan.status === 'in_progress' ? 'กรอกผลงานต่อ' : 'เริ่มกรอกผล'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-brand-green/10 p-12 text-center text-gray-400">
              <ClipboardCheck size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-sm">ไม่มีรายงานแผนงานตรวจมาตรฐานค้างประเมินของคุณในขณะนี้</p>
            </div>
          )}
        </div>
      ) : (
        
        // 2. AUDIT FORM WORKSPACE STATE
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          
          {/* Form Header Sticky */}
          <div className="bg-white p-4 rounded-2xl border border-brand-green/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActivePlan(null);
                  setSelectedPlanId(null);
                }}
                className="p-2 hover:bg-brand-cream rounded-xl text-gray-500 transition-colors"
                title="กลับไปหน้าหลัก"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="px-2 py-0.5 rounded bg-brand-green/10 text-brand-green text-[10px] font-mono font-bold">
                  {activePlan.id}
                </span>
                <h2 className="font-bold text-brand-green text-sm sm:text-base mt-0.5">
                  ตรวจหน้างาน: {stores.find(s => s.id === activePlan.storeId)?.name}
                </h2>
                <div className="text-[10px] sm:text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <User size={12} />
                    ผู้ตรวจ: {auditors.find(a => a.id === activePlan.auditorId)?.name}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Calendar size={12} />
                    วันเริ่มตรวจ: {formatBuddhistDate(auditDate)}
                  </span>
                  <span className="font-bold text-mystery-purple">
                    {activePlan.type === 'mystery' ? '🕵️ โหมด Mystery Shopper (เห็นเฉพาะโซนลูกค้า)' : '📋 โหมด Audit ปกติ (หลังร้านได้)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Score Display Badge */}
            <div className="flex items-center gap-3 bg-brand-cream/30 px-4 py-2 rounded-2xl border border-brand-green/10 self-end md:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">คะแนนคำนวณสด</span>
                <span className="text-xl sm:text-2xl font-extrabold text-brand-green leading-none">{liveScore} <span className="text-xs font-semibold text-gray-500">/ 100</span></span>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl text-white shadow ${
                liveGrade === 'A' ? 'bg-emerald-600' :
                liveGrade === 'B' ? 'bg-brand-green' :
                liveGrade === 'C' ? 'bg-brand-gold' : 'bg-brand-red'
              }`}>
                {liveGrade}
              </div>
            </div>
          </div>

          {/* Validation Warnings Box */}
          {showValidation && validationErrors.length > 0 && (
            <div className="bg-rose-50 border-2 border-brand-red/20 p-4 rounded-2xl space-y-2 text-brand-red font-bold text-xs sm:text-sm shadow-inner">
              <div className="flex items-center gap-1 text-brand-red">
                <AlertTriangle size={18} />
                <span>ตรวจพบข้อบกพร่อง/เกณฑ์ที่ไม่ผ่านเงื่อนไขการส่งข้อมูล ({validationErrors.length} ข้อ):</span>
              </div>
              <ul className="list-disc pl-5 font-medium space-y-1 text-gray-600 max-h-36 overflow-y-auto">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-xs">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Categories & Questions List */}
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-2xl border border-brand-green/10 shadow-sm overflow-hidden">
                {/* Category Header */}
                <div className="bg-brand-green/5 px-4 py-3 border-b border-brand-green/10 flex items-center justify-between text-xs sm:text-sm font-bold text-brand-green">
                  <span>{cat.name}</span>
                  <span className="bg-brand-green/10 px-2 py-0.5 rounded-lg text-xs">ค่าน้ำหนักหมวด: {cat.weight * 100}%</span>
                </div>

                {/* Questions List */}
                <div className="divide-y divide-gray-100">
                  {cat.items.map((item) => {
                    const isFailOrImprove = item.status === 'fail' || item.status === 'improve';
                    return (
                      <div key={item.id} className="p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                          {/* Question Text */}
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-gray-400">ข้อ {item.id}</span>
                            <h4 className="font-bold text-brand-dark text-sm sm:text-base leading-snug">{item.questionText}</h4>
                            {item.requiresPhotoOnFail && (
                              <span className="text-[10px] text-brand-red font-bold bg-brand-red/5 px-1.5 py-0.5 rounded-full inline-block mt-1">
                                📸 บังคับแนบรูปถ่ายหากประเมินไม่ผ่าน
                              </span>
                            )}
                          </div>

                          {/* Evaluation Status buttons */}
                          <div className="flex items-center gap-1 self-start shrink-0">
                            {(['pass', 'improve', 'fail', 'na'] as const).map((opt) => {
                              const isSelected = item.status === opt;
                              
                              let style = "border-gray-200 text-gray-500 hover:bg-gray-50";
                              if (isSelected) {
                                if (opt === 'pass') style = "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10";
                                else if (opt === 'improve') style = "bg-brand-gold text-brand-dark border-brand-gold shadow-sm shadow-brand-gold/10 font-bold";
                                else if (opt === 'fail') style = "bg-brand-red text-white border-brand-red shadow-sm shadow-brand-red/10";
                                else style = "bg-gray-500 text-white border-gray-500 shadow-sm";
                              }

                              const label = opt === 'pass' ? 'ผ่าน (1.0)' :
                                            opt === 'improve' ? 'ต้องปรับปรุง (0.5)' :
                                            opt === 'fail' ? 'ไม่ผ่าน (0)' : 'N/A';

                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleItemStatusChange(cat.id, item.id, opt)}
                                  className={`px-2.5 py-1.5 border text-xs font-semibold rounded-lg transition-all ${style}`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fail or Improve Conditional Evidence Sub-Form */}
                        {isFailOrImprove && (
                          <div className="bg-brand-cream/15 p-3 rounded-xl border border-dashed border-brand-green/20 space-y-3 pl-4 animate-in slide-in-from-top-1 duration-150">
                            
                            {/* Text feedback */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                                ระบุรายละเอียดความบกพร่อง / ข้อเสนอแนะแก้ไข <span className="text-brand-red">*</span>
                              </label>
                              <textarea
                                required
                                rows={2}
                                placeholder="กรุณาอธิบายรายละเอียด เช่น พนักงานไม่ได้ใช้คีมคีบขนมจีบ หรือพื้นลื่นคราบน้ำมันหน้าร้าน..."
                                value={item.notes}
                                onChange={(e) => handleItemTextChange(cat.id, item.id, e.target.value)}
                                className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green ${
                                  showValidation && !item.notes ? 'border-brand-red bg-rose-50' : 'border-brand-green/10 bg-white'
                                }`}
                              />
                            </div>

                            {/* Camera/Photo attach */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                                  รูปถ่ายหลักฐาน ณ หน้างาน {item.requiresPhotoOnFail && <span className="text-brand-red">*</span>}
                                </label>
                                <div className="flex items-center gap-2">
                                  <label className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg cursor-pointer text-xs font-bold transition-all ${
                                    showValidation && item.requiresPhotoOnFail && !item.photo
                                      ? 'border-brand-red text-brand-red bg-rose-50 hover:bg-rose-100'
                                      : 'border-brand-green/20 text-brand-green hover:bg-brand-green/5'
                                  }`}>
                                    <Camera size={14} />
                                    <span>ถ่ายภาพ / อัปโหลด</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handlePhotoUpload(cat.id, item.id, file);
                                      }}
                                    />
                                  </label>
                                  
                                  {item.photo && (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      <Check size={10} />
                                      อัปโหลดสำเร็จ
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Photo Preview */}
                              {item.photo && (
                                <div className="relative w-14 h-14 border border-brand-green/15 rounded-lg overflow-hidden group">
                                  <img src={item.photo} alt="Attached" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => {
                                      // Clear photo
                                      const updated = categories.map(c => {
                                        if (c.id !== cat.id) return c;
                                        return {
                                          ...c,
                                          items: c.items.map(i => i.id === item.id ? { ...i, photo: null } : i)
                                        };
                                      });
                                      setCategories(updated);
                                    }}
                                    className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
                                  >
                                    <XCircle size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions Footer */}
          <div className="bg-white p-4 rounded-2xl border border-brand-green/10 shadow-md flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setActivePlan(null);
                setSelectedPlanId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              ย้อนกลับ
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                <Save size={16} />
                <span>บันทึกร่าง</span>
              </button>
              
              <button
                type="button"
                onClick={handleSubmitResult}
                className="px-5 py-2 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-brand-green/10 transition-all"
              >
                <Send size={16} />
                <span>ส่งรายงานการตรวจ</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
