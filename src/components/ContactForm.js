import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { submitContactForm } from '../services/ContactService';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consultationContent: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Vietnamese phone number regex
  const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = t('contactForm.errors.nameRequired');
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      errors.name = t('contactForm.errors.nameLength');
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = t('contactForm.errors.phoneRequired');
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = t('contactForm.errors.phoneInvalid');
    }

    // Email validation
    if (!formData.email) {
      errors.email = t('contactForm.errors.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('contactForm.errors.emailInvalid');
    }

    // Consultation content validation
    if (!formData.consultationContent.trim()) {
      errors.consultationContent = t('contactForm.errors.contentRequired');
    } else if (formData.consultationContent.length < 10) {
      errors.consultationContent = t('contactForm.errors.contentLength');
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
      setSuccess(t('contactForm.successMessage'));
      setFormData({
        name: '',
        phone: '',
        email: '',
        consultationContent: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || t('contactForm.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('contactForm.title')}</h2>
        {error && (
          <div className="max-w-lg mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-lg transition-opacity duration-300">
            {error}
          </div>
        )}
        {success && (
          <div className="max-w-lg mx-auto mb-4 p-4 bg-green-100 text-green-700 rounded-lg transition-opacity duration-300">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">{t('contactForm.name')}</label>
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
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 mb-2">{t('contactForm.phone')}</label>
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
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">{t('contactForm.email')}</label>
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
          <div className="mb-4">
            <label htmlFor="consultationContent" className="block text-gray-700 mb-2">{t('contactForm.consultationContent')}</label>
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
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('contactForm.submitting') : t('contactForm.submit')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm; 