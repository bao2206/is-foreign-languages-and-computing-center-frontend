import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { getOpenClassesByCourseId } from '../services/ClassManagementService';
import 'bootstrap/dist/css/bootstrap.css';

const OpenClassesList = ({ courseId, onAddToClass }) => {
  const { t } = useTranslation();
  const [openClasses, setOpenClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOpenClasses = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await getOpenClassesByCourseId(courseId);
        if (response.success) {
          setOpenClasses(response.data);
        } else {
          setError(response.message || 'Failed to load open classes');
        }
      } catch (error) {
        console.error('Error loading open classes:', error);
        setError('Failed to load open classes');
      } finally {
        setLoading(false);
      }
    };

    loadOpenClasses();
  }, [courseId]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
          <p className="mt-2">{t('loadingOpenClasses')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center text-danger">
          <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (openClasses.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted">
          <i className="fas fa-graduation-cap fa-2x mb-2"></i>
          <h6>{t('noOpenClasses')}</h6>
          <p>{t('noOpenClassesMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">{t('openClasses')}</h6>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {openClasses.map((classItem) => (
            <div key={classItem._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-primary">
                <div className="card-body">
                  <h6 className="card-title text-primary">{classItem.classname}</h6>
                  <div className="card-text">
                    <small className="text-muted d-block">
                      <i className="fas fa-users me-1"></i>
                      {t('quantity')}: {Array.isArray(classItem.students) ? `${classItem.students.length}/` : ''}{classItem.quantity}
                    </small>
                    <small className="text-muted d-block">
                      <i className="fas fa-calendar me-1"></i>
                      {t('status')}: {t(classItem.status)}
                    </small>
                    {/* Start Date */}
                    {classItem.daybegin && (
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar-day me-1"></i>
                        {t('daybegin')}: {new Date(classItem.daybegin).toLocaleDateString('en-GB')}
                      </small>
                    )}
                    {/* End Date */}
                    {classItem.dayend && (
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar-check me-1"></i>
                        {t('dayend')}: {new Date(classItem.dayend).toLocaleDateString('en-GB')}
                      </small>
                    )}
                    {classItem.teacher && (
                      <small className="text-muted d-block">
                        <i className="fas fa-chalkboard-teacher me-1"></i>
                        {t('teacher')}: {classItem.teacher.name}
                      </small>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <Button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => onAddToClass(classItem)}
                  >
                    <i className="fas fa-plus me-1"></i>
                    {t('addToClass')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpenClassesList; 