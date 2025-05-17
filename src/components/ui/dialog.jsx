// src/components/ui/dialog.jsx
import React from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import "bootstrap/dist/css/bootstrap.css";

export const Dialog = ({ open, onOpenChange, children }) => (
  <HeadlessDialog open={open} onClose={() => onOpenChange(false)} className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen p-4">
      {children}
    </div>
  </HeadlessDialog>
);

export const DialogContent = ({ children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-xl w-full ${className}`}>{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="mb-4 border-b pb-2">{children}</div>
);
