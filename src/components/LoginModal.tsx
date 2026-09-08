import React from 'react';
import { X, ShieldCheck, UserCheck, Check } from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">User Authentication &amp; Roles</h3>
            <p className="text-xs text-slate-500">Select active operator profile</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {INITIAL_USERS.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                      <span>{user.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">
                        {user.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{user.department}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-5 h-5 text-teal-600" />}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Role permissions dictate invoice entry, review sign-off, and master table editing.
        </div>
      </div>
    </div>
  );
};
