import React from 'react';
import {
  FileSpreadsheet,
  ScanLine,
  Building2,
  LayoutDashboard,
  Cpu,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Download,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: User;
  onOpenLogin: () => void;
  onExportExcel: () => void;
  onOpenDocs: () => void;
  onOpenGoogleSheets: () => void;
  googleUserEmail?: string | null;
  pendingReviewCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onOpenLogin,
  onExportExcel,
  onOpenDocs,
  onOpenGoogleSheets,
  googleUserEmail,
  pendingReviewCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scan Invoice', icon: ScanLine, badge: pendingReviewCount > 0 ? pendingReviewCount : undefined },
    { id: 'ledger', label: 'Excel Ledger', icon: FileSpreadsheet },
    { id: 'masters', label: 'Master Mgmt', icon: Building2 },
    { id: 'futureready', label: 'Future ERP Hub', icon: Cpu },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-teal-500/40">
              Rx
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">DF PHARMACEUTICALS</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-teal-900/80 text-teal-300 px-1.5 py-0.5 rounded border border-teal-700/50">
                  Pharma ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Smart Tax Invoice Scanner &amp; Excel Automation
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => onSelectView(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons & User Profile */}
          <div className="flex items-center space-x-2.5">
            <button
              id="header-google-sheets-btn"
              onClick={onOpenGoogleSheets}
              title="Upload data to Google Sheets"
              className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 hover:text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-700/60 shadow-2xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Google Sheets</span>
              {googleUserEmail && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
            </button>

            <button
              id="header-export-excel-btn"
              onClick={onExportExcel}
              title="Download OpenPyXL / Excel Register"
              className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline">Export Excel</span>
            </button>

            <button
              id="header-system-docs-btn"
              onClick={onOpenDocs}
              title="System Documentation, Schema & Manual"
              className="flex items-center space-x-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Docs</span>
            </button>

            {/* User Session Profile Pill */}
            <div
              id="user-profile-widget"
              onClick={onOpenLogin}
              className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-750 px-2.5 py-1.5 rounded-lg border border-slate-700/80 cursor-pointer transition"
              title="Click to change active role or user account"
            >
              <div className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold text-teal-100">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-teal-400 capitalize font-medium flex items-center space-x-1">
                  <ShieldCheck className="w-2.5 h-2.5 inline" />
                  <span>{currentUser.role.replace('_', '/')}</span>
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Mobile Submenu Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
                  isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
