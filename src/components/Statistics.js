import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Statistics = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    successRate: 0
  });

  useEffect(() => {
    const targetCounts = {
      students: 1000,
      courses: 50,
      successRate: 95
    };

    const duration = 2000; // 2 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = {
      students: targetCounts.students / steps,
      courses: targetCounts.courses / steps,
      successRate: targetCounts.successRate / steps
    };

    const timer = setInterval(() => {
      setCounts(prev => ({
        students: Math.min(prev.students + increment.students, targetCounts.students),
        courses: Math.min(prev.courses + increment.courses, targetCounts.courses),
        successRate: Math.min(prev.successRate + increment.successRate, targetCounts.successRate)
      }));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      id: 1,
      title: t('statistics.students'),
      value: Math.round(counts.students)
    },
    {
      id: 2,
      title: t('statistics.courses'),
      value: Math.round(counts.courses)
    },
    {
      id: 3,
      title: t('statistics.successRate'),
      value: Math.round(counts.successRate)
    }
  ];

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('statistics.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map(stat => (
            <div key={stat.id} className="text-center p-6">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">{stat.value}+</h3>
              <p className="text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics; 