import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { fetchCourses } from '../../services/ManagementCourse';

const AdminConsultation = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consultationContent: '',
    status: 'pending',
    notes: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    assignedCourse: ''
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await fetchCourses();
        if (coursesData && Array.isArray(coursesData)) {
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    loadCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your API call here to create consultation
    try {
      // const response = await createAdminConsultation(formData);
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="container-fluid mt-4 px-3">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">{t('createConsultation')}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Student Information */}
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('studentName')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('assignedCourse')}</label>
                <select
                  name="assignedCourse"
                  value={formData.assignedCourse}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">{t('selectCourse')}</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.coursename}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent Information */}
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('parentName')}</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('parentPhone')}</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('parentEmail')}</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              {/* Consultation Details */}
              <div className="col-12 mb-3">
                <label className="form-label">{t('consultationContent')}</label>
                <textarea
                  name="consultationContent"
                  value={formData.consultationContent}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">{t('status')}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="pending">{t('pending')}</option>
                  <option value="in_progress">{t('inProgress')}</option>
                  <option value="completed">{t('completed')}</option>
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">{t('notes')}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button type="submit" className="btn btn-primary">
                {t('submit')}
              </Button>
              <Button type="button" className="btn btn-secondary">
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminConsultation; 