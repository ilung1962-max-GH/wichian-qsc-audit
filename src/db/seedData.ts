import type { Store, Auditor, AuditPlan, AuditResult, CAPAItem, AuditCategory } from '../types';

// 20 Stores seed data
export const seedStores: Store[] = [
  {
    id: 'ST-001',
    name: 'วิเชียรซาลาเปา สาขาสยามสแควร์',
    type: 'franchisor',
    address: 'สยามสแควร์ ซอย 3 เขตปทุมวัน กรุงเทพมหานคร 10330',
    lat: 13.7456,
    lng: 100.5302,
    managerName: 'อภิชาต รักดี',
    phone: '081-234-5678',
    openedDate: '2020-01-15',
    active: true
  },
  {
    id: 'ST-002',
    name: 'วิเชียรซาลาเปา สาขาเซ็นทรัลลาดพร้าว',
    type: 'franchisor',
    address: 'ชั้น G เซ็นทรัลลาดพร้าว ถ.พหลโยธิน เขตจตุจักร กรุงเทพมหานคร 10900',
    lat: 13.8161,
    lng: 100.5606,
    managerName: 'วิภา พรประเสริฐ',
    phone: '082-345-6789',
    openedDate: '2021-03-20',
    active: true
  },
  {
    id: 'ST-003',
    name: 'วิเชียรซาลาเปา สาขาม.เกษตรศาสตร์',
    type: 'franchisee',
    address: 'ตลาดอมรพันธ์ ถ.งามวงศ์วาน เขตจตุจักร กรุงเทพมหานคร 10900',
    lat: 13.8402,
    lng: 100.5739,
    managerName: 'ธนาพล บุญมี',
    phone: '083-456-7890',
    openedDate: '2022-05-10',
    active: true
  },
  {
    id: 'ST-004',
    name: 'วิเชียรซาลาเปา สาขาตลาด อ.ต.ก.',
    type: 'franchisee',
    address: 'แผงค้าที่ 45 ตลาด อ.ต.ก. ถ.กำแพงเพชร เขตจตุจักร กรุงเทพมหานคร 10900',
    lat: 13.7997,
    lng: 100.5472,
    managerName: 'มนัส เรียบร้อย',
    phone: '084-567-8901',
    openedDate: '2019-11-01',
    active: true
  },
  {
    id: 'ST-005',
    name: 'วิเชียรซาลาเปา สาขาฟิวเจอร์พาร์ครังสิต',
    type: 'franchisee',
    address: 'ชั้น B ฟิวเจอร์พาร์ครังสิต ถ.พหลโยธิน อ.ธัญบุรี ปทุมธานี 12110',
    lat: 13.9890,
    lng: 100.6178,
    managerName: 'สุรศักดิ์ คงมั่น',
    phone: '085-678-9012',
    openedDate: '2021-09-12',
    active: true
  },
  {
    id: 'ST-006',
    name: 'วิเชียรซาลาเปา สาขาเดอะมอลล์บางกะปิ',
    type: 'franchisee',
    address: 'ชั้น 1 เดอะมอลล์บางกะปิ ถ.ลาดพร้าว เขตบางกะปิ กรุงเทพมหานคร 10240',
    lat: 13.7699,
    lng: 100.6429,
    managerName: 'ดนัย นามดี',
    phone: '086-789-0123',
    openedDate: '2022-02-18',
    active: true
  },
  {
    id: 'ST-007',
    name: 'วิเชียรซาลาเปา สาขาตลาดยิ่งเจริญ',
    type: 'franchisee',
    address: 'แผงโครงการ 2 ตลาดยิ่งเจริญ ถ.พหลโยธิน เขตบางเขน กรุงเทพมหานคร 10220',
    lat: 13.8967,
    lng: 100.6074,
    managerName: 'กัลยา ใจใส',
    phone: '087-890-1234',
    openedDate: '2020-08-05',
    active: true
  },
  {
    id: 'ST-008',
    name: 'วิเชียรซาลาเปา สาขาม.มหิดล ศาลายา',
    type: 'franchisee',
    address: 'หน้ามหาวิทยาลัยมหิดล ถ.ศาลายา-นครชัยศรี อ.พุทธมณฑล นครปฐม 73170',
    lat: 13.7925,
    lng: 100.3256,
    managerName: 'สมโภช รักดี',
    phone: '088-901-2345',
    openedDate: '2023-01-20',
    active: true
  },
  {
    id: 'ST-009',
    name: 'วิเชียรซาลาเปา สาขาเซ็นทรัลปิ่นเกล้า',
    type: 'franchisee',
    address: 'ชั้น G เซ็นทรัลปิ่นเกล้า ถ.บรมราชชนนี เขตบางกอกน้อย กรุงเทพมหานคร 10700',
    lat: 13.7788,
    lng: 100.4764,
    managerName: 'รุ่งราตรี ศรีงาม',
    phone: '089-012-3456',
    openedDate: '2021-05-15',
    active: true
  },
  {
    id: 'ST-010',
    name: 'วิเชียรซาลาเปา สาขาตลาดไท',
    type: 'franchisee',
    address: 'โซนตลาดผลไม้ ตลาดไท ถ.พหลโยธิน อ.คลองหลวง ปทุมธานี 12120',
    lat: 14.0784,
    lng: 100.6148,
    managerName: 'วิเชียร ทรัพย์มาก',
    phone: '080-123-4567',
    openedDate: '2018-04-10',
    active: true
  },
  {
    id: 'ST-011',
    name: 'วิเชียรซาลาเปา สาขาเมเจอร์รัชโยธิน',
    type: 'franchisee',
    address: 'ชั้น 1 เมเจอร์รัชโยธิน ถ.พหลโยธิน เขตจตุจักร กรุงเทพมหานคร 10900',
    lat: 13.8298,
    lng: 100.5684,
    managerName: 'ธวัชชัย รื่นรมย์',
    phone: '081-345-6789',
    openedDate: '2022-07-22',
    active: true
  },
  {
    id: 'ST-012',
    name: 'วิเชียรซาลาเปา สาขาตลาดนครปฐม',
    type: 'franchisee',
    address: 'ตลาดบน ถ.ซ้ายพระ เขตเมืองนครปฐม นครปฐม 73000',
    lat: 13.8192,
    lng: 100.0601,
    managerName: 'พิสิษฐ์ เก่งกล้า',
    phone: '082-456-7890',
    openedDate: '2020-10-10',
    active: true
  },
  {
    id: 'ST-013',
    name: 'วิเชียรซาลาเปา สาขาโรบินสันชลบุรี',
    type: 'franchisee',
    address: 'ชั้น 1 โรบินสันชลบุรี ถ.สุขุมวิท อ.เมืองชลบุรี ชลบุรี 20000',
    lat: 13.3444,
    lng: 100.9702,
    managerName: 'อรทัย งามสิริ',
    phone: '083-567-8901',
    openedDate: '2021-12-05',
    active: true
  },
  {
    id: 'ST-014',
    name: 'วิเชียรซาลาเปา สาขาเซ็นทรัลเชียงใหม่',
    type: 'franchisee',
    address: 'ชั้น 2 เซ็นทรัลเชียงใหม่ ถ.ซุปเปอร์ไฮเวย์ อ.เมืองเชียงใหม่ เชียงใหม่ 50000',
    lat: 18.8006,
    lng: 99.0184,
    managerName: 'ณรงค์ศักดิ์ สุขดี',
    phone: '084-678-9012',
    openedDate: '2022-11-30',
    active: true
  },
  {
    id: 'ST-015',
    name: 'วิเชียรซาลาเปา สาขาเซ็นทรัลขอนแก่น',
    type: 'franchisee',
    address: 'ชั้น G เซ็นทรัลขอนแก่น ถ.ศรีจันทร์ อ.เมืองขอนแก่น ขอนแก่น 40000',
    lat: 16.4322,
    lng: 102.8258,
    managerName: 'สมพร ยิ้มแย้ม',
    phone: '085-789-0123',
    openedDate: '2023-04-12',
    active: true
  },
  {
    id: 'ST-016',
    name: 'วิเชียรซาลาเปา สาขาหาดใหญ่',
    type: 'franchisee',
    address: 'ตลาดกิมหยง ถ.ศุภสารรังสรรค์ อ.หาดใหญ่ สงขลา 90110',
    lat: 7.0092,
    lng: 100.4705,
    managerName: 'นิภา รักสัตย์',
    phone: '086-890-1234',
    openedDate: '2022-09-08',
    active: true
  },
  {
    id: 'ST-017',
    name: 'วิเชียรซาลาเปา สาขาตลาดหัวหิน',
    type: 'franchisee',
    address: 'ตลาดโต้รุ่งหัวหิน ถ.เดชานุชิต อ.หัวหิน ประจวบคีรีขันธ์ 77110',
    lat: 12.5707,
    lng: 99.9575,
    managerName: 'ประจวบ โชคดี',
    phone: '087-901-2345',
    openedDate: '2024-01-20',
    active: true
  },
  {
    id: 'ST-018',
    name: 'วิเชียรซาลาเปา สาขาภูเก็ตเมือง',
    type: 'franchisee',
    address: 'ถ.ถลาง ต.ตลาดใหญ่ อ.เมืองภูเก็ต ภูเก็ต 83000',
    lat: 7.8839,
    lng: 98.3900,
    managerName: 'ศิริชัย เลิศล้ำ',
    phone: '088-012-3456',
    openedDate: '2024-02-15',
    active: true
  },
  {
    id: 'ST-019',
    name: 'วิเชียรซาลาเปา สาขาตลาดรังสิต (เดิม)',
    type: 'franchisee',
    address: 'ตลาดรังสิต ปทุมธานี 12130',
    lat: 13.9840,
    lng: 100.6050,
    managerName: 'มานะ ขยันงาน',
    phone: '089-123-4567',
    openedDate: '2017-02-10',
    active: false
  },
  {
    id: 'ST-020',
    name: 'วิเชียรซาลาเปา สาขาบิ๊กซีอุดรธานี',
    type: 'franchisee',
    address: 'บิ๊กซี อุดรธานี 41000',
    lat: 17.4138,
    lng: 102.8202,
    managerName: 'ปวีณา อุดร',
    phone: '080-234-5678',
    openedDate: '2019-06-15',
    active: false
  }
];

// 6 Auditors seed data
export const seedAuditors: Auditor[] = [
  {
    id: 'AUD-001',
    name: 'สมชาย ตรวจดี',
    type: 'internal',
    registered: true,
    trainingStatus: 'passed',
    certExpiry: '2027-12-31',
    conflictStoreIds: [],
    active: true,
    auditCount: 15
  },
  {
    id: 'AUD-002',
    name: 'สมศรี ขยันตรวจ',
    type: 'internal',
    registered: true,
    trainingStatus: 'passed',
    certExpiry: '2027-06-30',
    conflictStoreIds: ['ST-003'], // conflict with ST-003 ม.เกษตรศาสตร์
    active: true,
    auditCount: 22
  },
  {
    id: 'AUD-003',
    name: 'สมศักดิ์ ละเอียด',
    type: 'internal',
    registered: true,
    trainingStatus: 'failed', // ยังไม่ผ่านอบรม
    certExpiry: null,
    conflictStoreIds: [],
    active: true,
    auditCount: 0
  },
  {
    id: 'AUD-004',
    name: 'วันชัย วิเคราะห์ตรง',
    type: 'independent',
    registered: true,
    trainingStatus: 'passed',
    certExpiry: '2025-12-31', // หมดอายุไปแล้ว (ปัจจุบันมิถุนายน 2026)
    conflictStoreIds: [],
    active: true,
    auditCount: 8
  },
  {
    id: 'AUD-005',
    name: 'จารุวรรณ ตาดี',
    type: 'independent',
    registered: true,
    trainingStatus: 'passed',
    certExpiry: '2028-05-20',
    conflictStoreIds: [],
    active: true,
    auditCount: 12
  },
  {
    id: 'AUD-006',
    name: 'สุวิมล ว่องไว',
    type: 'independent',
    registered: true,
    trainingStatus: 'passed',
    certExpiry: '2027-09-15',
    conflictStoreIds: [],
    active: false, // Inactive
    auditCount: 4
  }
];

// Checklists Template
export const getNormalChecklist = (): AuditCategory[] => [
  {
    id: 'C1',
    name: 'หมวด 1 — สุขลักษณะ & ความสะอาด [Cleanliness]',
    weight: 0.25,
    items: [
      { id: '1.1', questionText: 'พื้น/เคาน์เตอร์/รถเข็นสะอาด ไม่มีคราบมันหรือเศษอาหาร', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '1.2', questionText: 'ซึ้งนึ่งและอุปกรณ์สัมผัสอาหารสะอาด ไม่มีคราบสะสม', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '1.3', questionText: 'ผู้ขายสวมผ้ากันเปื้อน+หมวกแบรนด์ และใช้ที่คีบ/ถุงมือ', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: '1.4', questionText: 'ถังขยะมีฝาปิด และจัดการขยะถูกสุขลักษณะ', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'C2',
    name: 'หมวด 2 — คุณภาพสินค้า [Quality]',
    weight: 0.25,
    items: [
      { id: '2.1', questionText: 'ซาลาเปา/ขนมจีบสดใหม่ แป้งนุ่ม ไส้แน่นตามมาตรฐาน', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '2.2', questionText: 'อุณหภูมิอุ่นเสิร์ฟร้อนพอเหมาะ (ซึ้งทำงานปกติ)', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: '2.3', questionText: 'ไม่มีสินค้าค้างคืน/เกินอายุวางจำหน่าย', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '2.4', questionText: 'เครื่องเคียงครบ (จิ๊กโฉ่ว, กระเทียมเจียว) และสดใหม่', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'C3',
    name: 'หมวด 3 — มาตรฐานแบรนด์ & ป้าย [Brand & Signage]',
    weight: 0.15,
    items: [
      { id: '3.1', questionText: 'ป้ายแบรนด์ "วิเชียร" ติดตั้งครบ สภาพดี ไม่ซีดจาง', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '3.2', questionText: 'บรรจุภัณฑ์/ถุงใช้ของแบรนด์วิเชียรถูกต้อง', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: '3.3', questionText: 'ราคาขายตรงตามมาตรฐานที่กำหนด', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'C4',
    name: 'หมวด 4 — การบริการ [Service]',
    weight: 0.15,
    items: [
      { id: '4.1', questionText: 'พนักงานทักทาย สุภาพ ให้บริการรวดเร็ว', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: '4.2', questionText: 'ทอนเงิน/คิดเงินถูกต้อง มีช่องทางจ่ายเงินดิจิทัล', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: '4.3', questionText: 'จัดเรียงสินค้าหน้าร้านน่าซื้อ เป็นระเบียบ', status: null, notes: '', photo: null, requiresPhotoOnFail: true }
    ]
  },
  {
    id: 'C5',
    name: 'หมวด 5 — สต๊อก & Supply Chain [Stock & Supply Chain]',
    weight: 0.12,
    items: [
      { id: '5.1', questionText: 'มีสต๊อกวัตถุดิบเพียงพอ ไม่ขาดสินค้าขายดี', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: '5.2', questionText: 'จัดเก็บวัตถุดิบในตู้เย็น/ตู้แช่อุณหภูมิเหมาะสม', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '5.3', questionText: 'มีบันทึกการสั่งซื้อ-รับสินค้าจากครัวกลาง', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'C6',
    name: 'หมวด 6 — ความปลอดภัย [Cleanliness/Safety]',
    weight: 0.08,
    items: [
      { id: '6.1', questionText: 'ถังแก๊ส/สายแก๊สสภาพดี ไม่รั่ว ติดตั้งปลอดภัย', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: '6.2', questionText: 'มีอุปกรณ์ดับเพลิงเบื้องต้น/พร้อมรับเหตุฉุกเฉิน', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  }
];

export const getMysteryChecklist = (): AuditCategory[] => [
  {
    id: 'M1',
    name: 'M1 — การต้อนรับ & ความสุภาพ',
    weight: 0.20,
    items: [
      { id: 'M1.1', questionText: 'พนักงานทักทาย ยิ้มแย้ม สุภาพ', status: null, notes: '', photo: null, requiresPhotoOnFail: false },
      { id: 'M1.2', questionText: 'ให้คำแนะนำเมนู/ตอบคำถามได้ดี', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'M2',
    name: 'M2 — ความเร็วในการบริการ',
    weight: 0.15,
    items: [
      { id: 'M2.1', questionText: 'ได้รับสินค้าภายในเวลาที่เหมาะสม (เช่น < 3 นาที)', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'M3',
    name: 'M3 — ความสะอาดหน้าร้าน/พื้นที่ลูกค้า',
    weight: 0.20,
    items: [
      { id: 'M3.1', questionText: 'หน้าร้าน/เคาน์เตอร์/บริเวณที่ลูกค้าเห็นสะอาด', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: 'M3.2', questionText: 'พนักงานแต่งกายสะอาด ถูกสุขลักษณะ (เท่าที่ลูกค้าเห็น)', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'M4',
    name: 'M4 — คุณภาพ/ความสดของสินค้าที่ซื้อ',
    weight: 0.25,
    items: [
      { id: 'M4.1', questionText: 'ซาลาเปา/ขนมจีบที่ได้รับ สด ร้อน รสชาติได้มาตรฐาน', status: null, notes: '', photo: null, requiresPhotoOnFail: true },
      { id: 'M4.2', questionText: 'ปริมาณ/ขนาด/ไส้ ตรงตามมาตรฐานแบรนด์', status: null, notes: '', photo: null, requiresPhotoOnFail: true }
    ]
  },
  {
    id: 'M5',
    name: 'M5 — ป้ายราคา/ความถูกต้องการคิดเงิน',
    weight: 0.10,
    items: [
      { id: 'M5.1', questionText: 'มีป้ายราคาชัดเจน และคิดเงินถูกต้องตรงป้าย', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  },
  {
    id: 'M6',
    name: 'M6 — ภาพลักษณ์แบรนด์โดยรวม',
    weight: 0.10,
    items: [
      { id: 'M6.1', questionText: 'ป้าย/บรรจุภัณฑ์/ภาพรวมร้านสื่อถึงแบรนด์วิเชียรชัดเจน', status: null, notes: '', photo: null, requiresPhotoOnFail: false }
    ]
  }
];

// Placeholder for base64 images (before/after photos)
export const mockImages = {
  dirtyFloor: '/dirty_floor.png',
  dirtyEquipment: '/dirty_steamer.png',
  badSign: '/dirty_sign.png',
  dirtyCounter: '/dirty_counter.png',
  cleanFloor: '/clean_floor.png',
  cleanEquipment: '/clean_steamer.png',
  fixedSign: '/clean_sign.png'
};

// Complete mock AuditPlans, AuditResults, and CAPAItems
export const getInitialPlansAndResults = () => {
  const plans: AuditPlan[] = [
    {
      id: 'PL-001',
      storeId: 'ST-001',
      auditorId: 'AUD-001',
      type: 'normal',
      scheduledDate: '2026-02-15',
      status: 'closed',
      rescheduleHistory: []
    },
    {
      id: 'PL-002',
      storeId: 'ST-002',
      auditorId: 'AUD-001',
      type: 'normal',
      scheduledDate: '2026-03-10',
      status: 'closed',
      rescheduleHistory: []
    },
    {
      id: 'PL-003',
      storeId: 'ST-003',
      auditorId: 'AUD-005',
      type: 'normal',
      scheduledDate: '2026-04-05',
      status: 'closed',
      rescheduleHistory: []
    },
    {
      id: 'PL-004',
      storeId: 'ST-004',
      auditorId: 'AUD-002',
      type: 'normal',
      scheduledDate: '2026-04-20',
      status: 'closed',
      rescheduleHistory: []
    },
    {
      id: 'PL-005',
      storeId: 'ST-006',
      auditorId: 'AUD-001',
      type: 'normal',
      scheduledDate: '2026-05-15',
      status: 'awaiting_rca', // C (มี CAPA ค้าง - แฟรนไชส์ซียังไม่ได้ตอบ)
      rescheduleHistory: []
    },
    {
      id: 'PL-006',
      storeId: 'ST-010',
      auditorId: 'AUD-002',
      type: 'normal',
      scheduledDate: '2026-05-22',
      status: 'awaiting_followup', // D (คะแนนต่ำ มีปัญหาความปลอดภัย - ตอบ RCA แล้ว รอติดตามผล)
      rescheduleHistory: []
    },
    {
      id: 'PL-007',
      storeId: 'ST-005',
      auditorId: 'AUD-001',
      type: 'mystery',
      scheduledDate: '2026-06-05',
      status: 'closed', // Mystery audit closed
      rescheduleHistory: []
    },
    {
      id: 'PL-008',
      storeId: 'ST-011',
      auditorId: 'AUD-005',
      type: 'normal',
      scheduledDate: '2026-06-18',
      status: 'in_progress', // กำลังตรวจคาอยู่
      rescheduleHistory: []
    },
    // แผนในอนาคต/ค้างตรวจ
    {
      id: 'PL-009',
      storeId: 'ST-012',
      auditorId: 'AUD-001',
      type: 'normal',
      scheduledDate: '2026-07-10',
      status: 'planned',
      rescheduleHistory: []
    },
    {
      id: 'PL-010',
      storeId: 'ST-013',
      auditorId: 'AUD-002',
      type: 'mystery',
      scheduledDate: '2026-07-20',
      status: 'planned',
      rescheduleHistory: []
    },
    {
      id: 'PL-011',
      storeId: 'ST-014',
      auditorId: 'AUD-005',
      type: 'normal',
      scheduledDate: '2026-08-05',
      status: 'planned',
      rescheduleHistory: []
    },
    {
      id: 'PL-012',
      storeId: 'ST-015',
      auditorId: 'AUD-001',
      type: 'normal',
      scheduledDate: '2026-08-18',
      status: 'planned',
      rescheduleHistory: []
    },
    {
      id: 'PL-013',
      storeId: 'ST-016',
      auditorId: 'AUD-005',
      type: 'normal',
      scheduledDate: '2026-09-02',
      status: 'planned',
      rescheduleHistory: []
    },
    {
      id: 'PL-014',
      storeId: 'ST-003',
      auditorId: 'AUD-001', // OK, สมศรีมี conflict แต่สมชายตรวจได้
      type: 'mystery',
      scheduledDate: '2026-06-12',
      status: 'planned',
      rescheduleHistory: []
    },
    {
      id: 'PL-015',
      storeId: 'ST-008',
      auditorId: 'AUD-001',
      type: 'normal',
      scheduledDate: '2026-05-10',
      status: 'planned', // Overdue (กำหนดตรวจ 10 พ.ค. แต่ยังไม่ได้เริ่มตรวจ ณ 20 มิ.ย.)
      rescheduleHistory: [
        {
          originalDate: '2026-04-10',
          newDate: '2026-05-10',
          reason: 'ผู้ตรวจติดภารกิจด่วนพิเศษที่สำนักงานใหญ่',
          updatedAt: '2026-04-09'
        }
      ]
    }
  ];

  // Audit results mock data
  const results: AuditResult[] = [
    // PL-001: ST-001 (Siam Square) - 95 คะแนน (A)
    {
      id: 'PL-001',
      planId: 'PL-001',
      storeId: 'ST-001',
      auditorId: 'AUD-001',
      type: 'normal',
      auditDate: '2026-02-15',
      score: 95.0,
      grade: 'A',
      status: 'closed',
      createdAt: '2026-02-15T15:30:00Z',
      updatedAt: '2026-02-15T15:30:00Z',
      categories: getNormalChecklist().map(c => ({
        ...c,
        items: c.items.map(item => ({ ...item, status: 'pass' }))
      }))
    },
    // PL-002: ST-002 (Central Lardprao) - 92.5 คะแนน (A)
    {
      id: 'PL-002',
      planId: 'PL-002',
      storeId: 'ST-002',
      auditorId: 'AUD-001',
      type: 'normal',
      auditDate: '2026-03-10',
      score: 92.5,
      grade: 'A',
      status: 'closed',
      createdAt: '2026-03-10T14:20:00Z',
      updatedAt: '2026-03-10T14:20:00Z',
      categories: getNormalChecklist().map(c => ({
        ...c,
        items: c.items.map((item, idx) => ({ ...item, status: idx === 1 ? 'improve' : 'pass' }))
      }))
    },
    // PL-003: ST-003 (Kasetsart) - 84.5 คะแนน (B)
    {
      id: 'PL-003',
      planId: 'PL-003',
      storeId: 'ST-003',
      auditorId: 'AUD-005',
      type: 'normal',
      auditDate: '2026-04-05',
      score: 84.5,
      grade: 'B',
      status: 'closed',
      createdAt: '2026-04-05T16:00:00Z',
      updatedAt: '2026-04-05T16:00:00Z',
      categories: getNormalChecklist().map(c => ({
        ...c,
        items: c.items.map((item, idx) => ({
          ...item,
          status: c.id === 'C1' && idx === 0 ? 'improve' : 'pass'
        }))
      }))
    },
    // PL-004: ST-004 (Or Tor Kor) - 96.2 คะแนน (A)
    {
      id: 'PL-004',
      planId: 'PL-004',
      storeId: 'ST-004',
      auditorId: 'AUD-002',
      type: 'normal',
      auditDate: '2026-04-20',
      score: 96.2,
      grade: 'A',
      status: 'closed',
      createdAt: '2026-04-20T12:00:00Z',
      updatedAt: '2026-04-20T12:00:00Z',
      categories: getNormalChecklist().map(c => ({
        ...c,
        items: c.items.map(item => ({ ...item, status: 'pass' }))
      }))
    },
    // PL-005: ST-006 (The Mall Bangkapi) - 72.8 คะแนน (C) -> Awaiting RCA
    {
      id: 'PL-005',
      planId: 'PL-005',
      storeId: 'ST-006',
      auditorId: 'AUD-001',
      type: 'normal',
      auditDate: '2026-05-15',
      score: 72.8,
      grade: 'C',
      status: 'awaiting_rca',
      createdAt: '2026-05-15T15:30:00Z',
      updatedAt: '2026-05-15T15:30:00Z',
      categories: getNormalChecklist().map(c => ({
        ...c,
        items: c.items.map((item, idx) => {
          if (c.id === 'C1' && idx === 0) {
            return {
              ...item,
              status: 'fail',
              notes: 'พบเศษคราบน้ำมันและเศษซาลาเปาร่วงหล่นสะสมบริเวณหลังเคาน์เตอร์',
              photo: mockImages.dirtyFloor
            };
          }
          if (c.id === 'C3' && idx === 0) {
            return {
              ...item,
              status: 'improve',
              notes: 'ป้ายหน้าร้านคราบฝุ่นเกาะและตัวอักษรบางส่วนซีดจางเล็กน้อย',
              photo: mockImages.badSign
            };
          }
          return { ...item, status: 'pass' };
        })
      }))
    },
    // PL-006: ST-010 (Talat Thai) - 62.5 คะแนน (D) -> Awaiting Followup (RCA Submitted)
    {
      id: 'PL-006',
      planId: 'PL-006',
      storeId: 'ST-010',
      auditorId: 'AUD-002',
      type: 'normal',
      auditDate: '2026-05-22',
      score: 62.5,
      grade: 'D',
      status: 'awaiting_followup',
      createdAt: '2026-05-22T13:00:00Z',
      updatedAt: '2026-05-22T13:00:00Z',
      categories: getNormalChecklist().map(c => ({
        ...c,
        items: c.items.map((item, idx) => {
          if (c.id === 'C1' && idx === 1) {
            return {
              ...item,
              status: 'fail',
              notes: 'พบตะกร้าซึ้งนึ่งมีคราบแป้งสะสมแข็งตัว คล้ายไม่ได้ขัดถูทำความสะอาดใหญ่',
              photo: mockImages.dirtyEquipment
            };
          }
          if (c.id === 'C6' && idx === 0) {
            return {
              ...item,
              status: 'fail',
              notes: 'ถังแก๊สถูกวางอยู่ข้างเตาและไม่มีที่ยึดติดป้องกันการล้มอย่างเหมาะสม รวมถึงสายแก๊สเริ่มแข็งตัว',
              photo: mockImages.dirtyEquipment
            };
          }
          return { ...item, status: 'pass' };
        })
      }))
    },
    // PL-007: ST-005 (Future Park) - Mystery Shopper - 88.0 คะแนน (B) -> Closed
    {
      id: 'PL-007',
      planId: 'PL-007',
      storeId: 'ST-005',
      auditorId: 'AUD-001',
      type: 'mystery',
      auditDate: '2026-06-05',
      score: 88.0,
      grade: 'B',
      status: 'closed',
      createdAt: '2026-06-05T18:00:00Z',
      updatedAt: '2026-06-05T18:00:00Z',
      categories: getMysteryChecklist().map(c => ({
        ...c,
        items: c.items.map((item, idx) => {
          if (c.id === 'M3' && idx === 0) {
            return {
              ...item,
              status: 'improve',
              notes: 'หน้าร้านมีแก้วน้ำลูกค้าคนก่อนหน้าทิ้งไว้ และเช็ดถูเคาน์เตอร์ช้า',
              photo: mockImages.dirtyCounter
            };
          }
          return { ...item, status: 'pass' };
        })
      }))
    }
  ];

  // CAPA Items mock data
  const capa: CAPAItem[] = [
    // จากรายงาน PL-005 (ST-006 - เดอะมอลล์บางกะปิ)
    {
      id: 'CAPA-001',
      auditId: 'PL-005',
      storeId: 'ST-006',
      itemId: '1.1',
      questionText: 'พื้น/เคาน์เตอร์/รถเข็นสะอาด ไม่มีคราบมันหรือเศษอาหาร',
      notes: 'พบเศษคราบน้ำมันและเศษซาลาเปาร่วงหล่นสะสมบริเวณหลังเคาน์เตอร์',
      beforePhoto: mockImages.dirtyFloor,
      rca: null, // ยังไม่ตอบ
      status: 'open',
      followUpAuditorId: null,
      followUpDate: null,
      followUpPhoto: null,
      followUpNotes: null
    },
    {
      id: 'CAPA-002',
      auditId: 'PL-005',
      storeId: 'ST-006',
      itemId: '3.1',
      questionText: 'ป้ายแบรนด์ "วิเชียร" ติดตั้งครบ สภาพดี ไม่ซีดจาง',
      notes: 'ป้ายหน้าร้านคราบฝุ่นเกาะและตัวอักษรบางส่วนซีดจางเล็กน้อย',
      beforePhoto: mockImages.badSign,
      rca: null, // ยังไม่ตอบ
      status: 'open',
      followUpAuditorId: null,
      followUpDate: null,
      followUpPhoto: null,
      followUpNotes: null
    },
    // จากรายงาน PL-006 (ST-010 - ตลาดไท) - ตอบ RCA แล้ว รอติดตามผล
    {
      id: 'CAPA-003',
      auditId: 'PL-006',
      storeId: 'ST-010',
      itemId: '1.2',
      questionText: 'ซึ้งนึ่งและอุปกรณ์สัมผัสอาหารสะอาด ไม่มีคราบสะสม',
      notes: 'พบตะกร้าซึ้งนึ่งมีคราบแป้งสะสมแข็งตัว คล้ายไม่ได้ขัดถูทำความสะอาดใหญ่',
      beforePhoto: mockImages.dirtyEquipment,
      rca: {
        correction: 'นำตะกร้าซึ้งนึ่งทั้งหมดมาแช่น้ำและขัดคราบแป้งสะสมออกทั้งหมดเรียบร้อยแล้ว',
        rootCause: 'พนักงานกะดึกไม่ได้ขัดทำความสะอาดซึ้งนึ่งด้วยความลึกซึ้งเนื่องจากเหนื่อยล้า และหัวหน้าสาขาละเลยการตรวจสอบก่อนปิดร้าน (5 Whys: พนักงานข้ามขั้นตอน -> ไม่มีเช็คลิสต์ตรวจซ้ำ -> ละเลยการอบรมตรวจเช็คปิดร้าน -> ผู้จัดการสาขาติดธุระ)',
        preventiveAction: 'เพิ่มเช็คลิสต์ตรวจสอบความสะอาดอุปกรณ์ช่วงปิดร้านทุกวัน และผู้จัดการสาขาต้องถ่ายรูปซึ้งส่งเข้ากลุ่มไลน์รายงานตัวก่อนปิดร้าน'
      },
      status: 'rca_submitted',
      followUpAuditorId: null,
      followUpDate: null,
      followUpPhoto: null,
      followUpNotes: null
    },
    {
      id: 'CAPA-004',
      auditId: 'PL-006',
      storeId: 'ST-010',
      itemId: '6.1',
      questionText: 'ถังแก๊ส/สายแก๊สสภาพดี ไม่รั่ว ติดตั้งปลอดภัย',
      notes: 'ถังแก๊สถูกวางอยู่ข้างเตาและไม่มีที่ยึดติดป้องกันการล้มอย่างเหมาะสม รวมถึงสายแก๊สเริ่มแข็งตัว',
      beforePhoto: mockImages.dirtyEquipment,
      rca: {
        correction: 'จัดหาโซ่เหล็กมาคล้องล็อกถังแก๊สเข้ากับผนัง และทำการเปลี่ยนสายส่งแก๊สเส้นใหม่เรียบร้อยแล้ว',
        rootCause: 'ไม่มีมาตรฐานความปลอดภัยระบุให้ล็อกถังแก๊สในคู่มือติดตั้งร้านเดิม และสายแก๊สใช้งานมานานกว่า 2 ปีโดยไม่ได้วางระบบแจ้งเตือนเปลี่ยนรอบบำรุงรักษา',
        preventiveAction: 'ปรับปรุงคู่มือความปลอดภัยร้านค้า กำหนดให้ทุกถังแก๊สต้องมีโซ่คล้องผนัง และทำป้ายกำกับวันหมดอายุของสายส่งแก๊สติดไว้เพื่อเตือนเปลี่ยนทุกๆ 1.5 ปี'
      },
      status: 'rca_submitted',
      followUpAuditorId: null,
      followUpDate: null,
      followUpPhoto: null,
      followUpNotes: null
    },
    // CAPA ที่ปิดเรียบร้อยแล้ว (ปิดโดยผู้ตรวจคนใหม่ - เช่น สมศรีตรวจ สมชายปิด หรือวันชัยตรวจ จารุวรรณปิด)
    {
      id: 'CAPA-005',
      auditId: 'PL-007',
      storeId: 'ST-005',
      itemId: 'M3.1',
      questionText: 'หน้าร้าน/เคาน์เตอร์/บริเวณที่ลูกค้าเห็นสะอาด',
      notes: 'หน้าร้านมีแก้วน้ำลูกค้าคนก่อนหน้าทิ้งไว้ และเช็ดถูเคาน์เตอร์ช้า',
      beforePhoto: mockImages.dirtyCounter,
      rca: {
        correction: 'ให้พนักงานทำความสะอาดเคาน์เตอร์และเก็บขยะทันทีที่มีลูกค้าย้ายโต๊ะออก',
        rootCause: 'พนักงานคนเดียวต้องรับออเดอร์หน้าร้านพร้อมเสิร์ฟในช่วงเวลาเร่งด่วน ทำให้เก็บโต๊ะหน้าร้านไม่ทัน',
        preventiveAction: 'ปรับตารางเวรทำงานพนักงาน ให้มี 2 คนประจำการในช่วงเวลาเร่งด่วน 11:30 - 13:30 น. ของวันหยุดเสาร์-อาทิตย์'
      },
      status: 'verified_closed',
      followUpAuditorId: 'AUD-005', // ตรวจรอบแรก สมชาย (AUD-001) ตรวจติดตามโดย จารุวรรณ (AUD-005) - ผ่านเกณฑ์คนละคนกัน
      followUpDate: '2026-06-08',
      followUpPhoto: mockImages.cleanFloor,
      followUpNotes: 'ตรวจสอบหน้างานผ่านกล้องวงจรปิดและการเข้าสังเกตการณ์ พนักงานเก็บกวาดรวดเร็ว เคาน์เตอร์สะอาดเรียบร้อยดี',
    }
  ];

  return { plans, results, capa };
};
