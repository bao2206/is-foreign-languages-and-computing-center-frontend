import React, { useEffect, useState, useMemo } from "react";
import { fetchCoursesWithFilter } from "../services/ManagementCourse";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { CourseCard } from "../components/ui/CourseCard";
import { SearchBar } from "../components/ui/SearchBar";
import { FilterControls } from "../components/ui/FilterControls";
import { SortControls } from "../components/ui/SortControls";
import HomeHeader from "../components/Headers/HomeHeader";

const CoursePage = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [filters, setFilters] = useState({
    catalog: "",
    specialOnly: false,
    levels: [],
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sortMapping = {
          name_asc: { coursename: 1 },
          name_desc: { coursename: -1 },
          price_asc: { price: 1 },
          price_desc: { price: -1 },
          newest: { _id: -1 },
        };
        const sort = sortMapping[sortBy] || { coursename: 1 };

        const filtersObj = {
          page,
          limit,
          name: searchTerm,
          status: "active",
          is_special: filters.specialOnly,
          catalog: filters.catalog || undefined,
          level: filters.levels.length > 0 ? filters.levels : undefined,
          sort,
        };
        console.log(filtersObj);

        const data = await fetchCoursesWithFilter(filtersObj);
        console.log("length of courses:", data.data.length);

        setCourses(data.data || []);
        setTotalCourses(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setCourses([]);
      }
    };

    fetchData();
  }, [searchTerm, sortBy, filters, page, limit]);

  const specialCoursesCount = useMemo(
    () => courses.filter((course) => course.is_special).length,
    [courses]
  );

  return (
    <>
      <HomeHeader />
      {/* {Body} */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-80 space-y-6">
              <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 mb-6">
                <div className="px-2 sm:px-4 py-6">
                  <div className="flex items-center gap-8 justify-center">
                    <div className="text-center flex flex-col items-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {courses.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("courses")}
                      </div>
                    </div>
                    <div className="text-center flex flex-col items-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {specialCoursesCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {t("special")}
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              <FilterControls
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setPage(1);
                }}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Search and Sort */}
              <div className="mb-8 space-y-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("showing")} {courses.length} {t("of")} {totalCourses}{" "}
                    {t("courses")}
                  </p>
                  <SortControls
                    sortBy={sortBy}
                    onSortChange={(value) => {
                      setSortBy(value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Course Grid */}
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t("noCoursesFound")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("tryAdjustingSearch")}
                  </p>
                </div>
              )}
            </main>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 border rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                {t("previous")}
              </button>
              <span className="text-gray-700 dark:text-gray-200">
                {t("page")} {page} {t("of")} {totalPages}
              </span>
              <button
                className="px-3 py-1 border rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t("next")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePage;
