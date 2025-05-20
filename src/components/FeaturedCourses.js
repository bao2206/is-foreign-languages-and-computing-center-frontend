import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FeaturedCourses = () => {
  const { t } = useTranslation();

  const courses = [
    {
      id: 1,
      title: t('featuredCourses.course1.title'),
      description: t('featuredCourses.course1.description'),
      link: '/courses/course1'
    },
    {
      id: 2,
      title: t('featuredCourses.course2.title'),
      description: t('featuredCourses.course2.description'),
      link: '/courses/course2'
    },
    {
      id: 3,
      title: t('featuredCourses.course3.title'),
      description: t('featuredCourses.course3.description'),
      link: '/courses/course3'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('featuredCourses.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <Link to={course.link} className="text-blue-600 hover:underline">
                {t('featuredCourses.learnMore')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses; 