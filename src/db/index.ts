import Dexie, { type Table } from 'dexie';
import type { Store, Auditor, AuditPlan, AuditResult, CAPAItem } from '../types';
import { seedStores, seedAuditors, getInitialPlansAndResults } from './seedData';

export class QscAuditDatabase extends Dexie {
  stores!: Table<Store>;
  auditors!: Table<Auditor>;
  auditPlans!: Table<AuditPlan>;
  auditResults!: Table<AuditResult>;
  capaItems!: Table<CAPAItem>;

  constructor() {
    super('QscAuditDatabaseV2');
    this.version(1).stores({
      stores: 'id, name, type, active',
      auditors: 'id, name, type, active',
      auditPlans: 'id, storeId, auditorId, type, status, scheduledDate',
      auditResults: 'id, planId, storeId, auditorId, type, status, score, grade',
      capaItems: 'id, auditId, storeId, itemId, status'
    });
  }
}

export const db = new QscAuditDatabase();

// Seed data function if database is empty
export const seedDatabase = async () => {
  try {
    const storeCount = await db.stores.count();
    if (storeCount === 0) {
      console.log('Seeding initial QSC Audit data to IndexedDB...');
      await db.stores.bulkAdd(seedStores);
      await db.auditors.bulkAdd(seedAuditors);
      
      const { plans, results, capa } = getInitialPlansAndResults();
      await db.auditPlans.bulkAdd(plans);
      await db.auditResults.bulkAdd(results);
      await db.capaItems.bulkAdd(capa);
      
      console.log('IndexedDB seeded successfully!');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};
