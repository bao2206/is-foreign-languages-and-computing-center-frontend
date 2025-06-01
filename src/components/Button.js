// src/components/ui/button.js
import React from "react";
import "bootstrap/dist/css/bootstrap.css";

export const Button = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded ${className}`} {...props}>
    {children}
  </button>
);
