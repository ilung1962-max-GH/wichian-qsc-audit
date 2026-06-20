import React, { useState } from 'react';
import { useSystemStore } from '../../store';
import type { Store } from '../../types';
import { formatBuddhistDate } from '../../utils/helpers';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  X,
  Store as StoreIcon
} from 'lucide-react';

export const StoresView: React.FC = () => {
  const { stores, addStore, updateStore, userRole } = useSystemStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'franchisee' | 'franchisor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  
  // Form states
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'franchisee' | 'franchisor'>('franchisee');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(13.7367); // BKK defaults
  const [lng, setLng] = useState(100.5231);
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [openedDate, setOpenedDate] = useState('');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingStore(null);
    setId(`ST-0${stores.length + 1}`);
    setName('');
    setType('franchisee');
    setAddress('');
    setLat(13.7563);
    setLng(100.5018);
    setManagerName('');
    setPhone('');
    setOpenedDate(new Date().toISOString().split('T')[0]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setId(store.id);
    setName(store.name);
    setType(store.type);
    setAddress(store.address);
    setLat(store.lat);
    setLng(store.lng);
    setManagerName(store.managerName);
    setPhone(store.phone);
    setOpenedDate(store.openedDate);
    setActive(store.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storeData: Store = {
      id,
      name,
      type,
      address,
      lat: Number(lat),
      lng: Number(lng),
      managerName,
      phone,
      openedDate,
      active
    };

    if (editingStore) {
      await updateStore(storeData);
    } else {
      await addStore(storeData);
    }
    
    setIsModalOpen(false);
  };

  // Filtered stores list
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          store.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.managerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || store.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && store.active) || 
                         (statusFilter === 'inactive' && !store.active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalActive = stores.filter(s => s.active).length;
  const totalFranchisee = stores.filter(s => s.type === 'franchisee').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-green flex items-center gap-2">
            <StoreIcon size={28} className="text-brand-gold" />
            ทะเบียนร้านสาขา (Store Registry)
          </h1>
          <p className="text-sm text-gray-500">จัดการข้อมูลสาขา แฟรนไชส์ซี และสาขาต้นแบบ (ซอร์)</p>
        </div>
        {userRole === 'hq' && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-green/10 transition-all duration-200"
          >
            <Plus size={18} />
            <span>เพิ่มสาขาใหม่</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase">สาขาทั้งหมด</div>
          <div className="text-2xl font-extrabold text-brand-green mt-1">{stores.length} <span className="text-xs font-normal text-gray-500">สาขา</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase">กำลังเปิดบริการ (Active)</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalActive} <span className="text-xs font-normal text-gray-500">สาขา</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase">แฟรนไชส์ซี (ซี)</div>
          <div className="text-2xl font-extrabold text-brand-gold mt-1">{totalFranchisee} <span className="text-xs font-normal text-gray-500">สาขา</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-green/5 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase">สาขาต้นแบบ (ซอร์)</div>
          <div className="text-2xl font-extrabold text-brand-green mt-1">{stores.length - totalFranchisee} <span className="text-xs font-normal text-gray-500">สาขา</span></div>
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
            placeholder="ค้นหาชื่อสาขา, รหัส หรือผู้จัดการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brand-green/10 rounded-xl bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Filter size={16} />
            <span>กรอง:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">ทุกประเภท</option>
            <option value="franchisee">แฟรนไชส์ซี (ซี)</option>
            <option value="franchisor">สาขาต้นแบบ (ซอร์)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-brand-green/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">Active เท่านั้น</option>
            <option value="inactive">Inactive เท่านั้น</option>
          </select>
        </div>
      </div>

      {/* Stores List (Responsive Table/Cards) */}
      <div className="bg-white rounded-2xl border border-brand-green/5 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-green/5 border-b border-brand-green/10 text-brand-green font-bold text-sm">
                <th className="p-4 w-24">รหัส</th>
                <th className="p-4">ชื่อสาขา</th>
                <th className="p-4">ประเภท</th>
                <th className="p-4">ผู้จัดการ / เบอร์โทร</th>
                <th className="p-4">วันที่เปิด</th>
                <th className="p-4">สถานะ</th>
                {userRole === 'hq' && <th className="p-4 w-20">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green/5 text-sm text-gray-700">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-brand-cream/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-500">{store.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-brand-green">{store.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-0.5">
                        <MapPin size={12} />
                        {store.address}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        store.type === 'franchisor' 
                          ? 'bg-brand-green/10 text-brand-green' 
                          : 'bg-brand-gold/15 text-brand-dark'
                      }`}>
                        {store.type === 'franchisor' ? 'ซอร์ (ต้นแบบ)' : 'ซี (แฟรนไชส์)'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium flex items-center gap-1">
                        <User size={13} className="text-gray-400" />
                        {store.managerName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Phone size={11} className="text-gray-400" />
                        {store.phone}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        {formatBuddhistDate(store.openedDate)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        store.active 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {store.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {userRole === 'hq' && (
                      <td className="p-4">
                        <button
                          onClick={() => openEditModal(store)}
                          className="p-1.5 text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-all"
                          title="แก้ไขข้อมูลสาขา"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลสาขาที่ตรงกับการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block md:hidden divide-y divide-brand-green/5">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div key={store.id} className="p-4 hover:bg-brand-cream/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-gray-400">{store.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      store.type === 'franchisor' 
                        ? 'bg-brand-green/10 text-brand-green' 
                        : 'bg-brand-gold/15 text-brand-dark'
                    }`}>
                      {store.type === 'franchisor' ? 'ต้นแบบ (ซอร์)' : 'ซี (แฟรนไชส์)'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      store.active 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {store.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-brand-green text-sm">{store.name}</h3>
                  <p className="text-xs text-gray-500 flex items-start gap-0.5 mt-1">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                    {store.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-brand-green/5 text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[10px]">ผู้จัดการ</span>
                    <span className="font-semibold flex items-center gap-1 mt-0.5">
                      <User size={12} className="text-gray-400" />
                      {store.managerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">เบอร์ติดต่อ</span>
                    <span className="font-semibold flex items-center gap-1 mt-0.5">
                      <Phone size={12} className="text-gray-400" />
                      {store.phone}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[10px]">วันที่เริ่มเปิดดำเนินการ</span>
                    <span className="font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-gray-400" />
                      {formatBuddhistDate(store.openedDate)}
                    </span>
                  </div>
                </div>

                {userRole === 'hq' && (
                  <div className="flex justify-end pt-1.5 border-t border-brand-green/5">
                    <button
                      onClick={() => openEditModal(store)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-green bg-brand-green/5 rounded-lg font-semibold hover:bg-brand-green/10"
                    >
                      <Edit2 size={12} />
                      แก้ไขข้อมูล
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              ไม่พบข้อมูลสาขาที่ตรงกับการค้นหา
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-green/15 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-green text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-1.5 text-lg">
                <StoreIcon size={20} className="text-brand-gold" />
                {editingStore ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มทะเบียนสาขาใหม่'}
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
                {/* Store ID */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">รหัสสาขา</label>
                  <input
                    type="text"
                    required
                    disabled={editingStore !== null}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>

                {/* Store Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">ประเภทสาขา</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  >
                    <option value="franchisee">ซี (แฟรนไชส์)</option>
                    <option value="franchisor">ซอร์ (ต้นแบบ)</option>
                  </select>
                </div>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">ชื่อสาขา</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วิเชียรซาลาเปา สาขา..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">ที่ตั้ง / ที่อยู่โดยละเอียด</label>
                <textarea
                  required
                  rows={2}
                  placeholder="เลขที่ ถนน แขวง เขต จังหวัด..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>

              {/* Lat / Lng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">ละติจูด (Latitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">ลองจิจูด (Longitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
              </div>

              {/* Manager & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">ชื่อผู้จัดการสาขา</label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 08x-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
              </div>

              {/* Opened Date & Active Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">วันที่เริ่มเปิดดำเนินการ</label>
                  <input
                    type="date"
                    required
                    value={openedDate}
                    onChange={(e) => setOpenedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">สถานะการทำงาน</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
                    />
                    <label htmlFor="active" className="text-sm font-semibold text-gray-700">เปิดดำเนินการ (Active)</label>
                  </div>
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
                  {editingStore ? 'บันทึกการแก้ไข' : 'ลงทะเบียนสาขา'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
