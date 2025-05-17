// src/components/ui/card.jsx
import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-2xl shadow p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`mt-2 ${className}`} {...props}>
    {children}
  </div>
);
