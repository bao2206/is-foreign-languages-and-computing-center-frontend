import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Search } from 'lucide-react';
import { getConsultationProcessed } from '../services/ContactService';
import { fetchCourseById } from '../services/ManagementCourse';
import 'bootstrap/dist/css/bootstrap.css';

const ProcessedConsultationsList = ({ onViewDetails }) => {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courseNames, setCourseNames] = useState({});

  useEffect(() => {
    const loadConsultations = async () => {
      setLoading(true);
      try {
        const response = await getConsultationProcessed({
          page,
          limit,
          search: searchTerm
        });
        
        if (response.success) {
          console.log('Processed consultations data:', response.data);
          setConsultations(response.data);
          setTotal(response.pagination.total);
          setTotalPages(response.pagination.pages);
          
          // Fetch course names for all consultations with assigned courses
          response.data.forEach(consultation => {
            if (consultation.assignedCourse && consultation.assignedCourse._id) {
              fetchCourseName(consultation.assignedCourse._id);
            }
          });
        }
      } catch (error) {
        console.error('Error loading processed consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, [page, limit, searchTerm]);

  // Function to fetch course name by ID
  const fetchCourseName = async (courseId) => {
    if (!courseId || courseNames[courseId]) return;
    
    try {
      const course = await fetchCourseById(courseId);
      if (course && course.coursename) {
        setCourseNames(prev => ({
          ...prev,
          [courseId]: course.coursename
        }));
      }
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">{t('studentsWaitingForClass')}</h5>
      </div>
      <div className="card-body">
        {/* Search Bar */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={20} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={t('searchStudent')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students List */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>{t('assignedCourse')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    {t('loading')}...
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    {t('noStudentsFound')}
                  </td>
                </tr>
              ) : (
                consultations.map((consultation) => (
                  <tr key={consultation._id}>
                    <td>{consultation.name}</td>
                    <td>{consultation.email}</td>
                    <td>{consultation.phone}</td>
                    <td>
                      {(() => {
                        console.log('Consultation course data:', consultation.assignedCourse);
                        // Handle case where assignedCourse is just an ID object
                        if (consultation.assignedCourse && consultation.assignedCourse._id) {
                          const courseId = consultation.assignedCourse._id;
                          const courseName = courseNames[courseId];
                          
                          if (courseName) {
                            return courseName;
                          } else {
                            // Fetch course name if not already fetched
                            fetchCourseName(courseId);
                            return <span className="text-muted">Loading...</span>;
                          }
                        }
                        // Try different possible property names for full course object
                        const courseName = 
                          consultation.assignedCourse?.coursename ||
                          consultation.assignedCourse?.name ||
                          consultation.course?.coursename ||
                          consultation.course?.name ||
                          consultation.courseName ||
                          consultation.course;
                        return courseName || t('N/A');
                      })()}
                    </td>
                    <td>
                      <Button
                        className="btn btn-primary btn-sm"
                        onClick={() => onViewDetails(consultation)}
                      >
                        {t('viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    {t('previous')}
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${page === index + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    {t('next')}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessedConsultationsList; 