import React, { useState, useEffect, useContext } from 'react';

import 'bootstrap/dist/css/bootstrap.css';

import { Dialog } from '@headlessui/react';
import {fetchCertificatesByTeacherId} from '../../services/ManagementStaffService';

const { Button } = require('../Button');
export default function StaffInformation(props) {
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [showCertificates, setShowCertificates] = useState(false);

    const [isOpen, setIsOpen] = useState(true); 


    const [editStaffMode, setEditStaffMode] = useState(false);
    const [editedStaff, setEditedStaff] = useState({});
    const [newCertificate, setNewCertificate] = useState({
        certificateName: '',
        receivedDate: '',
        expirationDate: ''
    });

    useEffect(() => {
        // fetch certificates from API
        // setCertificates(fetchCertificatesByTeacherId(selectedStaff._id));
    }, []);

    useEffect(() => {
        if (props.staff) {
            setSelectedStaff(props.staff);
            setEditedStaff(props.staff);
        }
    }, [props.staff]);

    const handleStaffFieldChange = (e) => {
        const { name, value } = e.target;
        setEditedStaff((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNewCertChange = (e) => {
        const { name, value } = e.target;
        setNewCertificate((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddCertificate = () => {
        if (
            newCertificate.certificateName &&
            newCertificate.receivedDate &&
            newCertificate.expirationDate
        ) {
            setCertificates((prev) => [...prev, newCertificate]);
            setNewCertificate({
                certificateName: '',
                receivedDate: '',
                expirationDate: ''
            });
        }
    };

    const handleViewCertificates = (staffId) => {
        // Optionally fetch certificates from API by staffId
        setShowCertificates((prev) => !prev);
    };

    const handleEditCertificate = (cert) => {
        setNewCertificate(cert);
    };

    const onClose = () => {
        setIsOpen(false);
        props.onClose();
    }

    return (
        <div>
            <Dialog open={isOpen} onClose={() => onClose()} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
            <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
                {selectedStaff && (
                <div>
                    <h2 className="text-xl font-bold mb-2">Thông tin giảng viên</h2>
                    <img src={selectedStaff.avatar || 'https://via.placeholder.com/100'} className="w-24 h-24 rounded-full mb-2" alt="avatar" />
                    {editStaffMode ? (
                    <div className="space-y-2">
                        <input name="name" value={editedStaff.name} onChange={handleStaffFieldChange} className="w-full border px-3 py-2 rounded" />
                        <input name="email" value={editedStaff.email} onChange={handleStaffFieldChange} className="w-full border px-3 py-2 rounded" />
                        <input name="phone" value={editedStaff.phone} onChange={handleStaffFieldChange} className="w-full border px-3 py-2 rounded" />
                        <input name="citizenID" value={editedStaff.citizenID} onChange={handleStaffFieldChange} className="w-full border px-3 py-2 rounded" />
                    </div>
                    ) : (
                    <>
                        <p><strong>Họ tên:</strong> {selectedStaff.name}</p>
                        <p><strong>Email:</strong> {selectedStaff.email}</p>
                        <p><strong>SĐT:</strong> {selectedStaff.phone}</p>
                        <p><strong>CMND/CCCD:</strong> {selectedStaff.citizenID}</p>
                    </>
                    )}
                    <p><strong>Địa chỉ:</strong> {`${selectedStaff.address?.street || ''}, ${selectedStaff.address?.city || ''}, ${selectedStaff.address?.country || ''}`}</p>
                    <div className="mt-3 flex gap-2">
                    <Button onClick={() => handleViewCertificates(selectedStaff._id)}>
                        {showCertificates ? 'Ẩn chứng chỉ' : 'Xem chứng chỉ'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditStaffMode(prev => !prev)}>
                        {editStaffMode ? 'Lưu thông tin' : 'Chỉnh sửa'}
                    </Button>
                    </div>

                    {showCertificates && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Danh sách chứng chỉ:</h3>
                        <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left border">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1 whitespace-nowrap">Tên chứng chỉ</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Ngày nhận</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Hạn</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {certificates.map((cert, idx) => (
                                <tr key={idx} className={new Date(cert.expirationDate) < new Date() ? 'bg-red-100' : ''}>
                                <td className="border px-2 py-1 whitespace-nowrap">{cert.certificateName}</td>
                                <td className="border px-2 py-1 whitespace-nowrap">{new Date(cert.receivedDate).toLocaleDateString()}</td>
                                <td className="border px-2 py-1 whitespace-nowrap">{new Date(cert.expirationDate).toLocaleDateString()}</td>
                                <td className="border px-2 py-1 whitespace-nowrap">
                                    <Button variant="outline" size="sm" onClick={() => handleEditCertificate(cert)}>Chỉnh sửa</Button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                        <div className="mt-4">
                        <h4 className="font-semibold mb-2">Thêm chứng chỉ mới:</h4>
                        <div className="space-y-2">
                            <input name="certificateName" placeholder="Tên chứng chỉ" value={newCertificate.certificateName} onChange={handleNewCertChange} className="w-full border px-3 py-2 rounded" />
                            <input name="receivedDate" type="date" value={newCertificate.receivedDate} onChange={handleNewCertChange} className="w-full border px-3 py-2 rounded" />
                            <input name="expirationDate" type="date" value={newCertificate.expirationDate} onChange={handleNewCertChange} className="w-full border px-3 py-2 rounded" />
                            <Button onClick={handleAddCertificate}>Thêm chứng chỉ</Button>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                )}
                <div className="mt-4 text-right">
                <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </Dialog.Panel>
            </div>
        </Dialog>

        
        </div>
    );
}