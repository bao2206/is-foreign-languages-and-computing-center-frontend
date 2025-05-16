import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { Button } from '../components/Button';

import { useTranslation } from 'react-i18next';

// import StaffInformation from '../components/Dialogs/StaffInformation';

import 'bootstrap/dist/css/bootstrap.css';

const StaffPages = (props) => {
    const [Staffs, setStaffs] = useState([]);
    const [t, i18n] = useTranslation();

    return (
        <div className='p-4'>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Staffs.map(Staff => (
                <div key={Staff._id} className="border rounded-xl p-4 shadow">
                    <img src={Staff.avatar || 'https://via.placeholder.com/100'} alt={Staff.name} className="w-24 h-24 rounded-full object-cover mb-2" />
                    <h2 className="text-lg font-semibold">{Staff.name}</h2>
                    <p>{t('email')}: {Staff.email}</p>
                    <p>(t('phoneNumber')): {Staff.phone}</p>
                    {/* <Button className="mt-2" onClick={() => <StaffInformation staff = {Staff}/>}>{t("seeMore")}</Button> */}
                </div>
                ))}
            </div>
        </div>
    );
}

export default StaffPages;