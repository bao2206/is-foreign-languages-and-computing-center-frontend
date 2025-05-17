import React from 'react';
import { Link } from 'react-router-dom';

import '../css/ManagementHeader.css'; // Import your CSS file for styling
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { t } = useTranslation();
    return (
        <header className="flex header-container">
            <div className="container flex space-between align-center">
                <h1 className="header-title">{t("managementSytem")}</h1>
                <nav>
                <ul>
                    <li><Link to="/management/staff">{t("staffManagement")}</Link></li>
                    <li><Link to="/management">{t("courseManagement")}</Link></li>
                </ul>
                </nav>
            </div>
        </header>

    );
}
