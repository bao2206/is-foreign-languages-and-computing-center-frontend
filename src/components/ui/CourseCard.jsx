import React from 'react';
import { Star, Clock, Award, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CourseCard = ({ course }) => {
  const { t } = useTranslation();

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={Array.isArray(course.image) ? course.image[0] : course.image}
          alt={course.coursename}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.is_special && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Award className="w-4 h-4" />
            {t("special")}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm font-medium">
          {course.price ? `${course.price.toLocaleString()}₫` : t('free')}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Tag className="w-3 h-3 mr-1" />
            {course.catalog && course.catalog !== "None" ? t(course.catalog) : t("None")}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {course.coursename}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{course.numAllocatedPeriod} {t('period')}</span>
            </div>
          </div>
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            disabled={course.status !== "active"}
          >
            {course.status === "active" ? t("register_now") : t("enrollment_closed")}
          </button>
        </div>
      </div>
    </div>
  );
};
