import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../Button';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { getAllConsultations } from '../../services/ContactService';
import { fetchStudents } from '../../services/StudentService';
// import { fetchStudents } from '../../services/StudentService';

const AddStudentsToClass = ({ isOpen, onClose, classId, courseId, onAddStudents }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load contacts and students
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load contacts with pending status and matching course
        const contactsData = await getAllConsultations({
          status: 'pending',
          courseId: courseId
        });
        setContacts(contactsData.data || []);

        // Load existing students
        const studentsData = await fetchStudents({});
        setStudents(studentsData.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, [courseId]);

  const handleStudentSelect = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s._id === student._id);
      if (isSelected) {
        return prev.filter(s => s._id !== student._id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleAddStudents = () => {
    onAddStudents(selectedStudents);
    setSelectedStudents([]);
    onClose();
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <Dialog.Panel className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('addStudent')}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'existing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('existing')}
                >
                  {t('existingStudents')}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  {t('newStudents')}
                </button>
              </li>
            </ul>

            {/* Search */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('searchStudents')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Student List */}
            <div className="table-responsive" style={{ maxHeight: '400px' }}>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('email')}</th>
                    <th>{t('phone')}</th>
                    <th>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'existing' ? (
                    filteredStudents.map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.phone}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.some(s => s._id === student._id)}
                            onChange={() => handleStudentSelect(student)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredContacts.map(contact => (
                      <tr key={contact._id}>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.some(s => s._id === contact._id)}
                            onChange={() => handleStudentSelect(contact)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="text-center mt-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <Button
              className="btn btn-primary"
              onClick={handleAddStudents}
              disabled={selectedStudents.length === 0}
            >
              {t('add')} ({selectedStudents.length})
            </Button>
            <Button className="btn btn-secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddStudentsToClass; 