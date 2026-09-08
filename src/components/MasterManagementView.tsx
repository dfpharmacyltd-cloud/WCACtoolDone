import React, { useState } from 'react';
import {
  Building2,
  Layers,
  Plus,
  Edit,
  Trash2,
  Check,
  Search,
  AlertCircle,
  X,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Department, Vendor } from '../types';

interface MasterManagementViewProps {
  vendors: Vendor[];
  departments: Department[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onUpdateVendor: (id: string, vendor: Partial<Vendor>) => void;
  onDeleteVendor: (id: string) => void;
  onAddDepartment: (dept: Department) => void;
  onUpdateDepartment: (code: string, dept: Partial<Department>) => void;
  onDeleteDepartment: (code: string) => void;
}

export const MasterManagementView: React.FC<MasterManagementViewProps> = ({
  vendors,
  departments,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'departments'>('vendors');
  const [searchVendor, setSearchVendor] = useState('');

  // Vendor Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    department: 'RM',
    defaultCategory: 'Raw Material (API / Excipient)',
    gstin: '',
    contactPerson: '',
    email: '',
    phone: '',
    paymentTerms: 'Net 30 Days',
  });

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptCode, setEditingDeptCode] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    head: '',
    description: '',
    budgetCode: '',
  });

  // Filter vendors
  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchVendor.toLowerCase()) ||
      v.gstin.toLowerCase().includes(searchVendor.toLowerCase()) ||
      v.department.toLowerCase().includes(searchVendor.toLowerCase())
  );

  // Open Add Vendor Modal
  const handleOpenAddVendor = () => {
    setEditingVendorId(null);
    setVendorForm({
      name: '',
      department: 'RM',
      defaultCategory: 'Raw Material (API / Excipient)',
      gstin: '',
      contactPerson: '',
      email: '',
      phone: '',
      paymentTerms: 'Net 30 Days',
    });
    setIsVendorModalOpen(true);
  };

  // Open Edit Vendor Modal
  const handleOpenEditVendor = (v: Vendor) => {
    setEditingVendorId(v.id);
    setVendorForm({
      name: v.name,
      department: v.department,
      defaultCategory: v.defaultCategory,
      gstin: v.gstin,
      contactPerson: v.contactPerson,
      email: v.email,
      phone: v.phone,
      paymentTerms: v.paymentTerms,
    });
    setIsVendorModalOpen(true);
  };

  // Save Vendor
  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendorId) {
      onUpdateVendor(editingVendorId, vendorForm);
    } else {
      onAddVendor(vendorForm);
    }
    setIsVendorModalOpen(false);
  };

  // Open Add Dept Modal
  const handleOpenAddDept = () => {
    setEditingDeptCode(null);
    setDeptForm({
      code: '',
      name: '',
      head: '',
      description: '',
      budgetCode: '',
    });
    setIsDeptModalOpen(true);
  };

  // Open Edit Dept Modal
  const handleOpenEditDept = (d: Department) => {
    setEditingDeptCode(d.code);
    setDeptForm({
      code: d.code,
      name: d.name,
      head: d.head,
      description: d.description,
      budgetCode: d.budgetCode,
    });
    setIsDeptModalOpen(true);
  };

  // Save Dept
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeptCode) {
      onUpdateDepartment(editingDeptCode, deptForm);
    } else {
      onAddDepartment(deptForm);
    }
    setIsDeptModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Navigation Tabs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                Master Database Configuration
              </span>
              <span className="text-xs text-slate-500 font-medium">Automatic Department Routing Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Pharma Master Management
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Manage suppliers, departments, and procurement categories to enable automated AI classification.
            </p>
          </div>

          {/* Master Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-lg">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition ${
                activeTab === 'vendors' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Vendor Master ({vendors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition ${
                activeTab === 'departments' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Department Master ({departments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VENDOR MASTER TAB */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          {/* Intelligence Explanation Banner */}
          <div className="bg-teal-50/80 border border-teal-200 p-4 rounded-xl text-teal-900 text-xs flex items-start space-x-3">
            <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm text-teal-950">Vendor Master Intelligence: </span>
              When an invoice is scanned, the AI inspects the company name and GSTIN against this database. If matched, it automatically routes the invoice to the designated department (e.g.{' '}
              <span className="font-mono font-bold">ABC Chemicals → RM</span>,{' '}
              <span className="font-mono font-bold">XYZ Packaging → PM</span>,{' '}
              <span className="font-mono font-bold">Apex Bio-Tech → QC</span>).
            </div>
          </div>

          {/* Table Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                placeholder="Search vendor by name, GSTIN, or dept..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              id="btn-add-vendor"
              onClick={handleOpenAddVendor}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Vendor</span>
            </button>
          </div>

          {/* Vendor Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vendor / Supplier Name</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Default Category</th>
                  <th className="py-3 px-4">GSTIN Number</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{vendor.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-teal-50 text-teal-800 font-bold font-mono px-2 py-0.5 rounded border border-teal-200">
                        {vendor.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{vendor.defaultCategory}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{vendor.gstin}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{vendor.contactPerson}</div>
                      <div className="text-[10px] text-slate-400">{vendor.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{vendor.paymentTerms}</td>
                    <td className="py-3 px-4 text-center space-x-1">
                      <button
                        onClick={() => handleOpenEditVendor(vendor)}
                        className="p-1 rounded text-slate-600 hover:text-teal-700 hover:bg-slate-100"
                        title="Edit Vendor"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVendor(vendor.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                        title="Delete Vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPARTMENT MASTER TAB */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Total <strong>{departments.length}</strong> configured pharma manufacturing departments.
            </span>
            <button
              id="btn-add-dept"
              onClick={handleOpenAddDept}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Dept Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Head of Department</th>
                  <th className="py-3 px-4">Budget Code</th>
                  <th className="py-3 px-4 min-w-[200px]">Description</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.code} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3 px-4 text-slate-700">{dept.head}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{dept.budgetCode}</td>
                    <td className="py-3 px-4 text-slate-600">{dept.description}</td>
                    <td className="py-3 px-4 text-center space-x-1">
                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        className="p-1 rounded text-slate-600 hover:text-teal-700 hover:bg-slate-100"
                        title="Edit Department"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDepartment(dept.code)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENDOR MODAL */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingVendorId ? 'Edit Vendor Record' : 'Add New Vendor'}
              </h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. ABC Chemicals Pvt Ltd"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Department *</label>
                  <select
                    value={vendorForm.department}
                    onChange={(e) => setVendorForm({ ...vendorForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={vendorForm.gstin}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 24ABCDE1234F1Z5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Purchase Category</label>
                <input
                  type="text"
                  value={vendorForm.defaultCategory}
                  onChange={(e) => setVendorForm({ ...vendorForm, defaultCategory: e.target.value })}
                  placeholder="e.g. Raw Material (API / Excipient)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Shah"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 98250 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    placeholder="sales@vendor.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={vendorForm.paymentTerms}
                    onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
                    placeholder="e.g. Net 30 Days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingDeptCode ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dept Code *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingDeptCode)}
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. QC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget Code</label>
                  <input
                    type="text"
                    value={deptForm.budgetCode}
                    onChange={(e) => setDeptForm({ ...deptForm, budgetCode: e.target.value })}
                    placeholder="e.g. DEP-QC-103"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Quality Control Department"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Head of Department</label>
                <input
                  type="text"
                  value={deptForm.head}
                  onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                  placeholder="e.g. Dr. Meera Sengupta"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Brief description of department scope..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
