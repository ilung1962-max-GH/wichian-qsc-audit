// TypeScript Data Models for Smart QSC Audit System

export interface Store {
  id: string;            // รหัสสาขา เช่น "ST-001"
  name: string;          // ชื่อสาขา เช่น "วิเชียรซาลาเปา สาขาสยามสแควร์"
  type: 'franchisee' | 'franchisor'; // franchisee = ซี, franchisor = ซอร์ (ต้นแบบ)
  address: string;       // ที่อยู่สาขา
  lat: number;           // ละติจูด
  lng: number;           // ลองจิจูด
  managerName: string;   // ผู้จัดการสาขา
  phone: string;         // เบอร์ติดต่อ
  openedDate: string;    // วันที่เปิดสาขา (ISO Date เช่น "2024-01-15")
  active: boolean;       // สถานะ Active / Inactive
}

export interface Auditor {
  id: string;            // รหัสผู้ตรวจ เช่น "AUD-001"
  name: string;          // ชื่อผู้ตรวจ
  type: 'internal' | 'independent'; // internal = เจ้าหน้าที่ซอร์, independent = อิสระ
  registered: boolean;   // ขึ้นทะเบียนเสร็จสิ้น
  trainingStatus: 'passed' | 'failed' | 'none'; // สถานะอบรม
  certExpiry: string | null;  // วันหมดอายุใบรับรอง (ISO Date)
  conflictStoreIds: string[]; // รหัสสาขาที่มีผลประโยชน์ทับซ้อน (ห้ามไปตรวจ)
  active: boolean;       // สถานะ Active / Inactive
  auditCount: number;    // จำนวนครั้งที่เคยตรวจสำเร็จ
}

export interface RescheduleHistory {
  originalDate: string;  // วันที่เดิม
  newDate: string;       // วันที่ใหม่
  reason: string;        // เหตุผลการเลื่อน
  updatedAt: string;     // วันที่ทำการแก้ไขแผน
}

export interface AuditPlan {
  id: string;            // รหัสแผนงาน
  storeId: string;       // รหัสสาขาที่ตรวจ
  auditorId: string;     // รหัสผู้ตรวจหลัก
  type: 'normal' | 'mystery'; // รูปแบบการตรวจ
  scheduledDate: string; // วันที่วางแผนตรวจ (ISO Date)
  status: 'planned' | 'due' | 'in_progress' | 'awaiting_rca' | 'awaiting_followup' | 'closed';
  rescheduleHistory: RescheduleHistory[]; // ประวัติการเลื่อนแผน
}

export interface AuditItem {
  id: string;            // รหัสข้อตรวจ เช่น "1.1", "M1.1"
  questionText: string;  // คำอธิบายคำถามภาษาไทย
  status: 'pass' | 'improve' | 'fail' | 'na' | null; // ผ่าน (1.0), ต้องปรับปรุง (0.5), ไม่ผ่าน (0), N/A (ไม่คิดคะแนน)
  notes: string;         // ข้อเสนอแนะ (บังคับเมื่อ 'improve' หรือ 'fail')
  photo: string | null;  // รูปถ่ายหลักฐาน (Base64/Blob URL)
  requiresPhotoOnFail: boolean; // เงื่อนไขบังคับแนบรูปเมื่อไม่ผ่าน/ต้องปรับปรุง
}

export interface AuditCategory {
  id: string;            // รหัสหมวด เช่น "C1"
  name: string;          // ชื่อหมวด เช่น "สุขลักษณะ & ความสะอาด"
  weight: number;        // น้ำหนักหมวด เช่น 0.25 (25%)
  items: AuditItem[];    // ข้อตรวจย่อยในหมวดนี้
}

export interface AuditResult {
  id: string;            // รหัสผลการตรวจ (ตรงกับ planId หรือ auto-generated)
  planId: string;        // อ้างอิงแผนงาน
  storeId: string;       // อ้างอิงสาขา
  auditorId: string;     // อ้างอิงผู้ตรวจ
  type: 'normal' | 'mystery';
  auditDate: string;     // วันที่ทำการตรวจจริง
  categories: AuditCategory[]; // โครงสร้างข้อตรวจพร้อมผลประเมินที่บันทึก
  score: number;         // คะแนนรวมถ่วงน้ำหนัก (0 - 100)
  grade: 'A' | 'B' | 'C' | 'D'; // เกรดตามช่วงคะแนน (A: >=90, B: >=80, C: >=70, D: <70)
  status: 'in_progress' | 'awaiting_rca' | 'awaiting_followup' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface RCA {
  correction: string;      // การแก้ไขเฉพาะหน้า
  rootCause: string;       // การวิเคราะห์สาเหตุ (5 Whys)
  preventiveAction: string; // มาตรการป้องกันเกิดซ้ำ
}

export interface CAPAItem {
  id: string;              // รหัส CAPA เช่น "CAPA-001"
  auditId: string;         // อ้างอิงรายงานการตรวจต้นทาง
  storeId: string;         // อ้างอิงสาขา
  itemId: string;          // อ้างอิงรหัสข้อตรวจที่มีปัญหา (เช่น "1.1")
  questionText: string;    // รายละเอียดข้อตรวจ
  notes: string;           // ข้อสังเกต/เหตุผลที่ผู้ตรวจระบุ
  beforePhoto: string | null; // รูปภาพตอนตรวจพบปัญหา
  rca: RCA | null;         // แฟรนไชส์ซีระบุ RCA (ต้องกรอกครบ 3 ส่วน)
  status: 'open' | 'rca_submitted' | 'correction_done' | 'verified_closed';
  
  // การตรวจติดตามผล (Follow-up)
  followUpAuditorId: string | null; // ผู้ตรวจรอบติดตามผล (ห้ามเป็นคนเดียวกับ auditorId ใน AuditResult)
  followUpDate: string | null;      // วันตรวจติดตาม
  followUpPhoto: string | null;     // รูปถ่ายหลังแก้ไขเสร็จ (After Photo)
  followUpNotes: string | null;     // บันทึกการตรวจสอบของผู้ตรวจติดตามผล
}

export type UserRole = 'hq' | 'auditor' | 'franchisee';
