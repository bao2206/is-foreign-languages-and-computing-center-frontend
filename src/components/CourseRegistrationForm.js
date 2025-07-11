import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BookOpen, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { submitContactForm } from '../services/ContactService';

const CourseRegistrationForm = ({ course, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consultationContent: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    assignedCourse: course?._id || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Vietnamese phone number regex
  const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Update form data when course changes
  useEffect(() => {
    if (course) {
      setFormData(prev => ({
        ...prev,
        assignedCourse: course._id,
        consultationContent: `I would like to register for the course: ${course.coursename}`
      }));
    }
  }, [course]);

  // Auto-hide notifications after 10 seconds
  useEffect(() => {
    let timeoutId;
    if (error || success) {
      timeoutId = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 10000); // 10 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error, success]);

  const validateForm = () => {
    const errors = {};
    
    // Student name validation
    if (!formData.name.trim()) {
      errors.name = t('registrationForm.errors.nameRequired') || 'Student name is required';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      errors.name = t('registrationForm.errors.nameLength') || 'Name must be between 2 and 50 characters';
    }

    // Student phone validation
    if (!formData.phone) {
      errors.phone = t('registrationForm.errors.phoneRequired') || 'Student phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = t('registrationForm.errors.phoneInvalid') || 'Please enter a valid Vietnamese phone number';
    }

    // Student email validation
    if (!formData.email) {
      errors.email = t('registrationForm.errors.emailRequired') || 'Student email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('registrationForm.errors.emailInvalid') || 'Please enter a valid email address';
    }

    // Parent name validation (optional but if provided, validate)
    if (formData.parentName && (formData.parentName.length < 2 || formData.parentName.length > 50)) {
      errors.parentName = t('registrationForm.errors.parentNameLength') || 'Parent name must be between 2 and 50 characters';
    }

    // Parent phone validation (optional but if provided, validate)
    if (formData.parentPhone && !phoneRegex.test(formData.parentPhone)) {
      errors.parentPhone = t('registrationForm.errors.parentPhoneInvalid') || 'Please enter a valid Vietnamese phone number';
    }

    // Parent email validation (optional but if provided, validate)
    if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) {
      errors.parentEmail = t('registrationForm.errors.parentEmailInvalid') || 'Please enter a valid email address';
    }

    // Consultation content validation
    if (!formData.consultationContent.trim()) {
      errors.consultationContent = t('registrationForm.errors.contentRequired') || 'Registration message is required';
    } else if (formData.consultationContent.length < 10) {
      errors.consultationContent = t('registrationForm.errors.contentLength') || 'Message must be at least 10 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitContactForm(formData);
      setSuccess(t('registrationForm.successMessage') || 'Registration submitted successfully! We will contact you soon.');
      // Reset form but keep course assignment
      setFormData(prev => ({
        name: '',
        phone: '',
        email: '',
        consultationContent: `I would like to register for the course: ${course?.coursename}`,
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        assignedCourse: course?._id || ''
      }));
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('registrationForm.errorMessage') || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {t('registrationForm.title') || 'Course Registration'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Course Info */}
        {course && (
          <div className="p-6 bg-blue-50 border-b">
            <h3 className="font-semibold text-gray-900 mb-2">{t('registrationForm.selectedCourse') || 'Selected Course:'}</h3>
            <div className="flex items-center gap-3">
              {course.image && course.image.length > 0 && (
                <img 
                  src={course.image[0]} 
                  alt={course.coursename}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{course.coursename}</p>
                <p className="text-sm text-gray-600">
                  {course.price ? `${course.price.toLocaleString()}₫` : t('free')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('registrationForm.studentInfo') || 'Student Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    {t('registrationForm.studentName') || 'Student Name'} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    {t('registrationForm.studentPhone') || 'Student Phone'} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+84xxxxxxxxx"
                    required
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    {t('registrationForm.studentEmail') || 'Student Email'} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parent Information (Optional) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('registrationForm.parentInfo') || 'Parent Information'} ({t('registrationForm.optional') || 'Optional'})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentName" className="block text-gray-700 mb-2">
                    {t('registrationForm.parentName') || 'Parent Name'}
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${validationErrors.parentName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.parentName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.parentName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="parentPhone" className="block text-gray-700 mb-2">
                    {t('registrationForm.parentPhone') || 'Parent Phone'}
                  </label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${validationErrors.parentPhone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+84xxxxxxxxx"
                  />
                  {validationErrors.parentPhone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.parentPhone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="parentEmail" className="block text-gray-700 mb-2">
                    {t('registrationForm.parentEmail') || 'Parent Email'}
                  </label>
                  <input
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${validationErrors.parentEmail ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {validationErrors.parentEmail && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.parentEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="consultationContent" className="block text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('registrationForm.message') || 'Registration Message'} *
              </label>
              <textarea
                id="consultationContent"
                name="consultationContent"
                value={formData.consultationContent}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${validationErrors.consultationContent ? 'border-red-500' : 'border-gray-300'}`}
                rows="4"
                required
              />
              {validationErrors.consultationContent && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.consultationContent}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('registrationForm.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (t('registrationForm.submitting') || 'Submitting...') : (t('registrationForm.submit') || 'Submit Registration')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistrationForm; 