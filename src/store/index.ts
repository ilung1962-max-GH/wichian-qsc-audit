import { create } from 'zustand';
import type { Store, Auditor, AuditPlan, AuditResult, CAPAItem, UserRole } from '../types';
import { db, seedDatabase } from '../db';

interface SystemState {
  // Authentication & Session
  userRole: UserRole;
  currentUserId: string; // "AUD-001" for auditor, "ST-003" for Kasetsart Franchisee, etc.
  
  // Data
  stores: Store[];
  auditors: Auditor[];
  auditPlans: AuditPlan[];
  auditResults: AuditResult[];
  capaItems: CAPAItem[];
  isLoading: boolean;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPlanId: string | null;
  setSelectedPlanId: (id: string | null) => void;

  // Actions
  setRole: (role: UserRole) => void;
  setCurrentUserId: (id: string) => void;
  loadData: () => Promise<void>;
  
  // Store actions
  addStore: (store: Store) => Promise<void>;
  updateStore: (store: Store) => Promise<void>;
  
  // Auditor actions
  addAuditor: (auditor: Auditor) => Promise<void>;
  updateAuditor: (auditor: Auditor) => Promise<void>;
  
  // Planning actions
  addAuditPlan: (plan: AuditPlan) => Promise<void>;
  updateAuditPlan: (plan: AuditPlan) => Promise<void>;
  
  // Audit flow actions
  submitAuditResult: (result: AuditResult, newCAPAItems: CAPAItem[]) => Promise<void>;
  updateAuditResult: (result: AuditResult) => Promise<void>;
  
  // CAPA / RCA actions
  submitRCA: (capaId: string, rca: { correction: string; rootCause: string; preventiveAction: string }) => Promise<void>;
  verifyCAPA: (capaId: string, verifierId: string, notes: string, afterPhoto: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  userRole: 'hq',
  currentUserId: 'AUD-001', // Default mock user
  stores: [],
  auditors: [],
  auditPlans: [],
  auditResults: [],
  capaItems: [],
  isLoading: true,
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedPlanId: null,
  setSelectedPlanId: (id) => set({ selectedPlanId: id }),

  setRole: (role) => {
    // Set appropriate default user ID when switching roles
    let defaultUserId = '';
    if (role === 'hq') {
      defaultUserId = 'HQ-ADMIN';
    } else if (role === 'auditor') {
      defaultUserId = 'AUD-001';
    } else if (role === 'franchisee') {
      defaultUserId = 'ST-003'; // Default franchisee is ST-003 (ม.เกษตร)
    }
    set({ userRole: role, currentUserId: defaultUserId });
  },

  setCurrentUserId: (id) => set({ currentUserId: id }),

  loadData: async () => {
    set({ isLoading: true });
    // Ensure db is seeded
    await seedDatabase();
    
    // Load from Dexie IndexedDB
    const stores = await db.stores.toArray();
    const auditors = await db.auditors.toArray();
    const auditPlans = await db.auditPlans.toArray();
    const auditResults = await db.auditResults.toArray();
    const capaItems = await db.capaItems.toArray();

    // Sort plans by date descending
    auditPlans.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    // Sort results by date descending
    auditResults.sort((a, b) => b.auditDate.localeCompare(a.auditDate));

    set({
      stores,
      auditors,
      auditPlans,
      auditResults,
      capaItems,
      isLoading: false
    });
  },

  resetDatabase: async () => {
    set({ isLoading: true });
    await db.stores.clear();
    await db.auditors.clear();
    await db.auditPlans.clear();
    await db.auditResults.clear();
    await db.capaItems.clear();
    
    // Seed database again
    await seedDatabase();
    
    // Reload
    const stores = await db.stores.toArray();
    const auditors = await db.auditors.toArray();
    const auditPlans = await db.auditPlans.toArray();
    const auditResults = await db.auditResults.toArray();
    const capaItems = await db.capaItems.toArray();

    auditPlans.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    auditResults.sort((a, b) => b.auditDate.localeCompare(a.auditDate));

    set({
      stores,
      auditors,
      auditPlans,
      auditResults,
      capaItems,
      isLoading: false
    });
  },

  addStore: async (store) => {
    await db.stores.put(store); // put inserts or updates
    set((state) => ({ stores: [...state.stores.filter(s => s.id !== store.id), store] }));
  },

  updateStore: async (store) => {
    await db.stores.put(store);
    set((state) => ({ stores: state.stores.map(s => s.id === store.id ? store : s) }));
  },

  addAuditor: async (auditor) => {
    await db.auditors.put(auditor);
    set((state) => ({ auditors: [...state.auditors.filter(a => a.id !== auditor.id), auditor] }));
  },

  updateAuditor: async (auditor) => {
    await db.auditors.put(auditor);
    set((state) => ({ auditors: state.auditors.map(a => a.id === auditor.id ? auditor : a) }));
  },

  addAuditPlan: async (plan) => {
    await db.auditPlans.put(plan);
    set((state) => {
      const updated = [...state.auditPlans.filter(p => p.id !== plan.id), plan];
      updated.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
      return { auditPlans: updated };
    });
  },

  updateAuditPlan: async (plan) => {
    await db.auditPlans.put(plan);
    set((state) => ({
      auditPlans: state.auditPlans.map(p => p.id === plan.id ? plan : p)
    }));
  },

  submitAuditResult: async (result, newCAPAItems) => {
    // 1. Save result to IndexedDB
    await db.auditResults.put(result);
    
    // 2. Update plan status in IndexedDB
    const plan = await db.auditPlans.get(result.planId);
    if (plan) {
      plan.status = result.status; // awaiting_rca, closed, etc.
      await db.auditPlans.put(plan);
    }

    // 3. Save new CAPA items to IndexedDB
    if (newCAPAItems.length > 0) {
      await db.capaItems.bulkPut(newCAPAItems);
    }

    // 4. Update auditor audit count in IndexedDB
    const auditor = await db.auditors.get(result.auditorId);
    if (auditor) {
      auditor.auditCount = (auditor.auditCount || 0) + 1;
      await db.auditors.put(auditor);
    }

    // Reload all data from DB to ensure state consistency
    const stores = await db.stores.toArray();
    const auditors = await db.auditors.toArray();
    const auditPlans = await db.auditPlans.toArray();
    const auditResults = await db.auditResults.toArray();
    const capaItems = await db.capaItems.toArray();

    auditPlans.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    auditResults.sort((a, b) => b.auditDate.localeCompare(a.auditDate));

    set({
      stores,
      auditors,
      auditPlans,
      auditResults,
      capaItems
    });
  },

  updateAuditResult: async (result) => {
    await db.auditResults.put(result);
    set((state) => ({
      auditResults: state.auditResults.map(r => r.id === result.id ? result : r)
    }));
  },

  submitRCA: async (capaId, rca) => {
    const capa = await db.capaItems.get(capaId);
    if (capa) {
      capa.rca = rca;
      capa.status = 'rca_submitted';
      await db.capaItems.put(capa);

      // Check if all CAPA items for this audit have RCA submitted.
      // If they have all been submitted, update the audit result status and plan status to 'awaiting_followup'
      const auditId = capa.auditId;
      const allCapaForAudit = await db.capaItems.where('auditId').equals(auditId).toArray();
      const allRcaSubmitted = allCapaForAudit.every(item => item.status === 'rca_submitted' || item.status === 'verified_closed');

      if (allRcaSubmitted) {
        const result = await db.auditResults.get(auditId);
        if (result && result.status === 'awaiting_rca') {
          result.status = 'awaiting_followup';
          await db.auditResults.put(result);
        }

        const plan = await db.auditPlans.get(auditId);
        if (plan && plan.status === 'awaiting_rca') {
          plan.status = 'awaiting_followup';
          await db.auditPlans.put(plan);
        }
      }
    }

    // Reload data to reflect state
    const loadedCapa = await db.capaItems.toArray();
    const loadedPlans = await db.auditPlans.toArray();
    const loadedResults = await db.auditResults.toArray();
    
    set({
      capaItems: loadedCapa,
      auditPlans: loadedPlans,
      auditResults: loadedResults
    });
  },

  verifyCAPA: async (capaId, verifierId, notes, afterPhoto) => {
    const capa = await db.capaItems.get(capaId);
    if (capa) {
      capa.followUpAuditorId = verifierId;
      capa.followUpDate = new Date().toISOString().split('T')[0];
      capa.followUpNotes = notes;
      capa.followUpPhoto = afterPhoto;
      capa.status = 'verified_closed';
      await db.capaItems.put(capa);

      // Check if all CAPA items for this audit are now closed.
      // If yes, change audit and plan status to 'closed'.
      const auditId = capa.auditId;
      const allCapaForAudit = await db.capaItems.where('auditId').equals(auditId).toArray();
      const allClosed = allCapaForAudit.every(item => item.status === 'verified_closed');

      if (allClosed) {
        const result = await db.auditResults.get(auditId);
        if (result) {
          result.status = 'closed';
          await db.auditResults.put(result);
        }

        const plan = await db.auditPlans.get(auditId);
        if (plan) {
          plan.status = 'closed';
          await db.auditPlans.put(plan);
        }
      }
    }

    // Reload data
    const loadedCapa = await db.capaItems.toArray();
    const loadedPlans = await db.auditPlans.toArray();
    const loadedResults = await db.auditResults.toArray();

    set({
      capaItems: loadedCapa,
      auditPlans: loadedPlans,
      auditResults: loadedResults
    });
  }
}));
