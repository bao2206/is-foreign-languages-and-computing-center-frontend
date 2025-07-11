import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { fetchSpecialCourses } from '../services/ManagementCourse';

const FeaturedCourses = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSpecialCourses = async () => {
      try {
        setLoading(true);
        const specialCourses = await fetchSpecialCourses();
        setCourses(specialCourses);
      } catch (err) {
        console.error('Error loading special courses:', err);
        setError('Failed to load special courses');
      } finally {
        setLoading(false);
      }
    };

    loadSpecialCourses();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(courses.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(courses.length / 3)) % Math.ceil(courses.length / 3));
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('featuredCourses.title') || 'Featured Courses'}</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('featuredCourses.title') || 'Featured Courses'}</h2>
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('featuredCourses.title') || 'Featured Courses'}</h2>
          <div className="text-center text-gray-600">
            <p>No special courses available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const slides = [];
  for (let i = 0; i < courses.length; i += 3) {
    slides.push(courses.slice(i, i + 3));
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('featuredCourses.title') || 'Featured Courses'}
          <div className="flex items-center justify-center mt-2">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            <span className="text-lg text-gray-600">Special Courses</span>
          </div>
        </h2>
        
        <div className="relative">
          {/* Navigation Buttons */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Course Slider */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slideCourses, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {slideCourses.map(course => (
                      <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Course Image */}
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={course.image && course.image.length > 0 
                              ? course.image[0] 
                              : 'https://picsum.photos/400/300?random=' + course._id
                            } 
                            alt={course.coursename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://picsum.photos/400/300?random=' + course._id;
                            }}
                          />
                        </div>
                        
                        {/* Course Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                              {course.coursename}
                            </h3>
                            {course.is_special && (
                              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {course.description || course.coursename}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(course.price)}
                            </span>
                            {course.catalog && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {course.catalog}
                              </span>
                            )}
                          </div>
                          
                          <Link 
                            to={`/courses/${course._id}`} 
                            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {t('featuredCourses.learnMore') || 'Learn More'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          {slides.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses; 