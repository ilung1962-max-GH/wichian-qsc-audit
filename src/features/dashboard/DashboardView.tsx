import React from 'react';
import { useSystemStore } from '../../store';
import type { AuditResult } from '../../types';
import { formatBuddhistDate } from '../../utils/helpers';
import { Mascot } from '../../components/Mascot';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Star,
  Award,
  ShieldAlert,
  Percent,
  TrendingDown
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    auditResults, 
    capaItems, 
    stores, 
    auditPlans,
    userRole, 
    currentUserId,
    setActiveTab
  } = useSystemStore();

  const CURRENT_DATE_STR = '2026-06-20';

  const getStoreName = (storeId: string) => {
    return stores.find(s => s.id === storeId)?.name || storeId;
  };

  // ----------------------------------------------------
  // DATA PREPARATION & CALCULATIONS
  // ----------------------------------------------------

  // Filter completed/submitted audits (not in_progress drafts)
  const completedAudits = auditResults.filter(r => r.status !== 'in_progress');

  // Filter based on role: Franchisee only sees their own store
  const roleFilteredResults = completedAudits.filter(r => {
    if (userRole === 'franchisee') return r.storeId === currentUserId;
    return true;
  });

  const roleFilteredCapa = capaItems.filter(c => {
    if (userRole === 'franchisee') return c.storeId === currentUserId;
    return true;
  });

  const roleFilteredPlans = auditPlans.filter(p => {
    if (userRole === 'franchisee') {
      // Mystery plans that are NOT completed/closed are hidden from Franchisee!
      if (p.type === 'mystery' && p.status !== 'closed' && p.status !== 'awaiting_followup' && p.status !== 'awaiting_rca') {
        return false;
      }
      return p.storeId === currentUserId;
    }
    return true;
  });

  // Calculate KPIs
  const totalAuditsCount = roleFilteredResults.length;
  
  const averageScore = totalAuditsCount > 0 
    ? Math.round((roleFilteredResults.reduce((sum, r) => sum + r.score, 0) / totalAuditsCount) * 10) / 10
    : 0;

  // Under standard branches (Score < 80)
  // For HQ, count unique stores that scored < 80 in their latest audit
  const getLatestAuditPerStore = (resultsList: AuditResult[]) => {
    const latestMap: { [storeId: string]: AuditResult } = {};
    // Results are sorted by date descending, so first encountered is latest
    resultsList.forEach(r => {
      if (!latestMap[r.storeId]) {
        latestMap[r.storeId] = r;
      }
    });
    return Object.values(latestMap);
  };

  const latestAudits = getLatestAuditPerStore(completedAudits);
  const belowStandardCount = latestAudits.filter(r => r.score < 80).length;

  const pendingCapaCount = roleFilteredCapa.filter(c => c.status !== 'verified_closed').length;

  // Plan progress stats
  const totalPlans = roleFilteredPlans.length;
  const planCompleted = roleFilteredPlans.filter(p => p.status === 'closed').length;
  const planAwaiting = roleFilteredPlans.filter(p => p.status === 'awaiting_rca' || p.status === 'awaiting_followup').length;

  const planProgressPercent = totalPlans > 0 
    ? Math.round(((planCompleted + planAwaiting) / totalPlans) * 100)
    : 0;

  // ----------------------------------------------------
  // CHART 1: Average Scores by Store (HQ View only)
  // ----------------------------------------------------
  const storeBarData = latestAudits.map(r => {
    const store = stores.find(s => s.id === r.storeId);
    return {
      name: store ? store.name.replace('วิเชียรซาลาเปา สาขา', '') : r.storeId,
      score: r.score,
      grade: r.grade
    };
  }).sort((a, b) => b.score - a.score);

  // ----------------------------------------------------
  // CHART 2: Trend over quarters (e.g. Q1, Q2 2026)
  // ----------------------------------------------------
  const trendData = [
    { name: 'ม.ค.', avgScore: 88 },
    { name: 'ก.พ.', avgScore: 95.0 }, // PL-001 (95.0)
    { name: 'มี.ค.', avgScore: 92.5 }, // PL-002 (92.5)
    { name: 'เม.ย.', avgScore: 90.35 }, // Average PL-003, PL-004 (84.5 + 96.2) / 2
    { name: 'พ.ค.', avgScore: 67.65 }, // Average PL-005, PL-006 (72.8 + 62.5) / 2
    { name: 'มิ.ย. (ปัจจุบัน)', avgScore: averageScore } // Current average
  ];

  // ----------------------------------------------------
  // WIDGET: Compare Normal Audit vs Mystery Shopper (Same branch)
  // ----------------------------------------------------
  const getMysteryCompareData = () => {
    // Find stores that have BOTH normal audit and mystery shopper results
    const comparison: { storeName: string; normal: number; mystery: number; diff: number }[] = [];
    
    stores.forEach(store => {
      const normalResult = completedAudits.find(r => r.storeId === store.id && r.type === 'normal');
      const mysteryResult = completedAudits.find(r => r.storeId === store.id && r.type === 'mystery');
      
      if (normalResult && mysteryResult) {
        const diff = normalResult.score - mysteryResult.score;
        comparison.push({
          storeName: store.name.replace('วิเชียรซาลาเปา สาขา', ''),
          normal: normalResult.score,
          mystery: mysteryResult.score,
          diff: Math.round(diff * 10) / 10
        });
      }
    });
    
    return comparison;
  };

  const mysteryComparison = getMysteryCompareData();

  // ----------------------------------------------------
  // MASCOT SPEECH GENERATOR
  // ----------------------------------------------------
  const getMascotMessage = () => {
    if (userRole === 'hq') {
      if (belowStandardCount > 0) {
        return `สวัสดีครับผู้บริหาร! คะแนนเฉลี่ย QSC ภาพรวมอยู่ที่ ${averageScore} คะแนน แต่ยังมีสาขาต่ำกว่าเกณฑ์มาตรฐานอยู่ ${belowStandardCount} แห่ง และมี CAPA ค้าง ${pendingCapaCount} รายการ รีบกำชับทีมเข้าตรวจสอบติดตามนะครับ!`;
      }
      return `ยอดเยี่ยมมากครับผู้บริหาร! คะแนนเฉลี่ย QSC ภาพรวมของแบรนด์เราอยู่ในเกณฑ์ดีเยี่ยมที่ ${averageScore} คะแนน ทุกสาขาดูแลสุขลักษณะความสะอาดได้ดีมากครับ!`;
    } else if (userRole === 'auditor') {
      const myDueAudits = auditPlans.filter(p => p.auditorId === currentUserId && p.scheduledDate < CURRENT_DATE_STR && p.status === 'planned').length;
      if (myDueAudits > 0) {
        return `สวัสดีครับเพื่อนผู้ตรวจ! คุณมีแผนการเข้าตรวจประเมินหน้างานที่ เกินกำหนด (Overdue) อยู่ ${myDueAudits} ร้านในขณะนี้ รีบออกหน้าร้านและเช็คความถูกต้องของเกณฑ์ความสะอาดกันเลยครับ!`;
      }
      return `สวัสดีครับพี่ๆ ผู้ตรวจ! พร้อมลงพื้นที่ลุยตรวจมาตรฐานร้านกันต่อหรือยังครับ? หน้าประเมินพร้อมเก็บภาพหลักฐานแบบออฟไลน์เรียบร้อยครับ!`;
    } else {
      // Franchisee view
      const myStore = stores.find(s => s.id === currentUserId);
      const myLatest = roleFilteredResults[0];
      if (myLatest) {
        if (myLatest.score < 80) {
          return `โอ๊ะโอ! ผลตรวจล่าสุดสาขาของคุณได้ ${myLatest.score} คะแนน (เกรด ${myLatest.grade}) ซึ่งต่ำกว่าเกณฑ์มาตรฐานนะครับ มีประเด็นความปลอดภัยที่ต้องแก้ไขด่วน ยื่นรายงาน RCA ชี้แจงเข้ามาได้เลยครับผม`;
        }
        return `ยินดีด้วยครับเจ้าของสาขา ${myStore?.name.replace('วิเชียรซาลาเปา สาขา', '')}! ผลประเมินมาตรฐาน QSC ล่าสุดของคุณได้ ${myLatest.score} คะแนน (เกรด ${myLatest.grade}) นึ่งซาลาเปาได้แป้งนุ่มไส้แน่น สะอาดสะอ้าน รักษามาตรฐานนี้ไว้ต่อไปนะครับ!`;
      }
      return `สวัสดีครับเจ้าของสาขา! ยินดีต้อนรับสู่ระบบประเมินมาตรฐานร้านวิเชียรซาลาเปา ร่วมสร้างสุขลักษณะและรสชาติที่ดีเยี่ยมไปด้วยกันครับ!`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Board with Mascot */}
      <div className="bg-white p-5 rounded-3xl border border-brand-green/10 shadow-sm flex flex-col md:flex-row items-center gap-5">
        <Mascot size="lg" message={getMascotMessage()} className="shrink-0" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-brand-green">
            {userRole === 'hq' && 'แผงควบคุมหลักผู้บริหารแฟรนไชส์ซอร์'}
            {userRole === 'auditor' && 'ระบบรายงานการปฏิบัติงานผู้ตรวจประเมิน'}
            {userRole === 'franchisee' && `ยินดีต้อนรับ แฟรนไชส์ซี สาขา ${stores.find(s => s.id === currentUserId)?.name.replace('วิเชียรซาลาเปา สาขา', '')}`}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            ข้อมูลอัปเดตออฟไลน์ล่าสุด ณ วันที่ {formatBuddhistDate(CURRENT_DATE_STR)} (พ.ศ. 2569)
          </p>
          
          {userRole === 'franchisee' && (
            <div className="inline-flex gap-4 pt-2 text-xs font-bold text-gray-500">
              <span>ประเภท: <strong className="text-brand-green">ซี (แฟรนไชส์ซี)</strong></span>
              <span>สถานะร้าน: <strong className="text-emerald-600">เปิดดำเนินการปกติ</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Dashboard Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Avg Score */}
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">คะแนนเฉลี่ยระบบ</span>
            <Star size={16} className="text-brand-gold fill-brand-gold" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-brand-green">
              {averageScore} <span className="text-xs font-normal text-gray-400">/ 100</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {userRole === 'franchisee' ? 'คะแนนเฉลี่ยของคุณ' : 'คำนวณถ่วงน้ำหนักรวม'}
            </p>
          </div>
        </div>

        {/* Card 2: Below standard / My Rank */}
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm flex flex-col justify-between">
          {userRole === 'franchisee' ? (
            <>
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">เกรดประเมินล่าสุด</span>
                <Award size={16} className="text-brand-green" />
              </div>
              <div className="mt-2">
                <div className={`text-2xl sm:text-3xl font-black ${
                  roleFilteredResults[0]?.grade === 'A' ? 'text-emerald-600' :
                  roleFilteredResults[0]?.grade === 'B' ? 'text-brand-green' : 'text-brand-gold'
                }`}>
                  เกรด {roleFilteredResults[0]?.grade || '-'}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  มาตรฐานความปลอดภัย QSC
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">ต่ำกว่าเกณฑ์มาตรฐาน</span>
                <ShieldAlert size={16} className="text-brand-red" />
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-black text-brand-red">
                  {belowStandardCount} <span className="text-xs font-normal text-gray-400">สาขา</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  สาขาที่มีคะแนนประเมินต่ำกว่า 80
                </p>
              </div>
            </>
          )}
        </div>

        {/* Card 3: Pending CAPAs */}
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">ประเด็นแก้ไข (CAPA)</span>
            <AlertTriangle size={16} className="text-brand-gold" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-brand-gold">
              {pendingCapaCount} <span className="text-xs font-normal text-gray-400">รายการ</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              ค้างระบุ RCA หรือ รอตรวจติดตามผล
            </p>
          </div>
        </div>

        {/* Card 4: Plan coverage */}
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">ความคืบหน้าแผนตรวจ</span>
            <Calendar size={16} className="text-brand-green" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-brand-green">
              {planProgressPercent}%
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              ตรวจแล้วหรือรอผล {planCompleted + planAwaiting} จาก {totalPlans} แผนงาน
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Charts & Comparisons */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trend Chart Panel */}
          <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-brand-green text-sm sm:text-base flex items-center gap-1.5">
                <TrendingUp size={18} className="text-brand-gold" />
                แนวโน้มพัฒนาการคะแนน QSC รายเดือน (ปี 2569)
              </h3>
            </div>
            
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F1E8" />
                  <XAxis dataKey="name" stroke="#1C2C28" />
                  <YAxis domain={[50, 100]} stroke="#1C2C28" />
                  <Tooltip formatter={(value) => [`${value} คะแนน`, 'คะแนนเฉลี่ย']} />
                  <Line 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="#0E5C4A" 
                    strokeWidth={3} 
                    activeDot={{ r: 8 }} 
                    dot={{ stroke: '#D99A2B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mystery Shopper Discrepancy comparison (HQ and Auditor view only) */}
          {userRole !== 'franchisee' && mysteryComparison.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
              <h3 className="font-extrabold text-brand-green text-sm sm:text-base flex items-center gap-1.5 mb-3">
                <Percent size={18} className="text-mystery-purple" />
                ดัชนีต่างคะแนนตรวจปกติ vs Mystery Shopper
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-brand-green/5 text-brand-green font-bold border-b border-brand-green/10">
                      <th className="p-2.5">ชื่อสาขา</th>
                      <th className="p-2.5 text-center">ตรวจเปิดเผยปกติ (A)</th>
                      <th className="p-2.5 text-center">ลูกค้าประเมินลับ (B)</th>
                      <th className="p-2.5 text-center">ส่วนต่างผลคะแนน (A - B)</th>
                      <th className="p-2.5">บทวิเคราะห์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {mysteryComparison.map((row, idx) => (
                      <tr key={idx} className="hover:bg-brand-cream/10">
                        <td className="p-2.5 font-bold text-brand-dark">{row.storeName}</td>
                        <td className="p-2.5 text-center font-semibold">{row.normal}</td>
                        <td className="p-2.5 text-center font-semibold text-mystery-purple">{row.mystery}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            row.diff > 10 ? 'bg-rose-100 text-brand-red' : 
                            row.diff < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {row.diff > 0 ? `+${row.diff}` : row.diff}
                          </span>
                        </td>
                        <td className="p-2.5 text-xs text-gray-500 font-medium">
                          {row.diff > 10 ? (
                            <span className="text-brand-red flex items-center gap-0.5 font-semibold">
                              <TrendingDown size={12} />
                              สาขาจัดฉาก! ตอนตรวจปกติสวยงาม แต่บริการลูกค้าจริงตกมาตรฐาน
                            </span>
                          ) : row.diff < 0 ? (
                            <span className="text-emerald-700 flex items-center gap-0.5 font-semibold">
                              <TrendingUp size={12} />
                              ลูกค้าประทับใจบริการดีเป็นพิเศษ
                            </span>
                          ) : (
                            <span className="text-gray-400">ระดับมาตรฐานใกล้เคียงสม่ำเสมอดี</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Average Scores by Store Bar Chart (HQ only) */}
          {userRole === 'hq' && storeBarData.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
              <h3 className="font-extrabold text-brand-green text-sm sm:text-base flex items-center gap-1.5 mb-4">
                <Award size={18} className="text-brand-gold" />
                จัดอันดับผลคะแนนประเมินร้านสาขาในระบบ (Latest QSC)
              </h3>
              
              <div className="h-60 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F1E8" />
                    <XAxis dataKey="name" stroke="#1C2C28" />
                    <YAxis domain={[0, 100]} stroke="#1C2C28" />
                    <Tooltip formatter={(value) => [`${value} คะแนน`, 'คะแนนล้าสุด']} />
                    <Bar dataKey="score" fill="#0E5C4A" radius={[6, 6, 0, 0]}>
                      {storeBarData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.score < 80 ? '#C0392B' : '#0E5C4A'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Rankings List & Pending Tasks */}
        <div className="space-y-6">
          
          {/* Action Tasks Widget */}
          <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
            <h3 className="font-extrabold text-brand-green text-sm sm:text-base flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <span>งานค้างดำเนินการ (Pending Tasks)</span>
              <span className="bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full text-xs font-bold">{pendingCapaCount}</span>
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {roleFilteredCapa.filter(c => c.status !== 'verified_closed').length > 0 ? (
                roleFilteredCapa.filter(c => c.status !== 'verified_closed').map((capa) => (
                  <div 
                    key={capa.id} 
                    onClick={() => setActiveTab('capa')}
                    className="p-2.5 border border-brand-green/10 rounded-xl hover:bg-brand-cream/20 cursor-pointer transition-all flex justify-between items-start gap-2"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-gray-400">{capa.id}</span>
                      <div className="text-xs font-bold text-brand-green truncate max-w-[140px] sm:max-w-none">
                        {getStoreName(capa.storeId)}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium truncate max-w-[150px] sm:max-w-none">
                        ข้อ {capa.itemId}: {capa.questionText}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      capa.status === 'open' ? 'bg-rose-100 text-brand-red' : 'bg-amber-100 text-brand-dark'
                    }`}>
                      {capa.status === 'open' ? 'รอ RCA' : 'รอติดตาม'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center">
                  <CheckCircle size={32} className="text-emerald-500 mb-2" />
                  <span>ไม่มีงานค้างทำในขณะนี้ ยอดเยี่ยมมากครับ!</span>
                </div>
              )}
            </div>
          </div>

          {/* Standings list (Leaderboard) (HQ and Auditor view only) */}
          {userRole !== 'franchisee' && storeBarData.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
              <h3 className="font-extrabold text-brand-green text-sm sm:text-base border-b border-gray-100 pb-2 mb-3">
                ตารางสรุปอันดับสาขา (League Table)
              </h3>
              
              <div className="space-y-2">
                {storeBarData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded-full ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                        idx === 1 ? 'bg-gray-100 text-gray-800' :
                        idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-brand-cream/30 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold truncate max-w-[140px] sm:max-w-none">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.score}</span>
                      <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold text-white ${
                        item.score >= 90 ? 'bg-emerald-600' :
                        item.score >= 80 ? 'bg-brand-green' :
                        item.score >= 70 ? 'bg-brand-gold' : 'bg-brand-red'
                      }`}>
                        {item.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
