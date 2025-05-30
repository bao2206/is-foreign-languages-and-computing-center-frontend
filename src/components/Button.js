// src/components/ui/button.js
import React from "react";
import "bootstrap/dist/css/bootstrap.css";

export const Button = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded bg-blue-600 ${className}`} {...props}>
    {children}
  </button>
);
