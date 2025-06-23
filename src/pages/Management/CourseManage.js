import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/Button";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  fetchCoursesWithFilter,
  updateCourse,
  createCourse,
} from "../../services/ManagementCourse";
import uploadImages from "../../services/UploadFile";
import { useTranslation } from "react-i18next";

const CourseCard = ({ course, onUpdate }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCourse, setEditedCourse] = useState({
    ...course,
    newImages: [],
  });
  const [imageErrors, setImageErrors] = useState("");

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % course.image.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? course.image.length - 1 : prev - 1
    );
  };

  const handleCardClick = () => {
    setOpen(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      let imageUrls = editedCourse.image || [];
      if (editedCourse.newImages && editedCourse.newImages.length > 0) {
        const uploadResult = await uploadImages(editedCourse.newImages, true);
        imageUrls = [...imageUrls, ...(uploadResult.imageUrls || [])];
      }

      const updatedCourseData = {
        ...editedCourse,
        image: imageUrls,
        newImages: undefined,
      };

      const updatedCourse = await updateCourse(course._id, updatedCourseData);
      onUpdate(updatedCourse);
      setEditedCourse({ ...updatedCourse, newImages: [] });
      setIsEditing(false);
      setImageErrors("");
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course: " + error.message);
    }
  };

  const handleCancel = () => {
    setEditedCourse({ ...course, newImages: [] });
    setIsEditing(false);
    setImageErrors("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedCourse((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const readers = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((images) => {
        setEditedCourse((prev) => ({
          ...prev,
          newImages: [...(prev.newImages || []), ...images],
        }));
        setImageErrors("");
      })
      .catch((error) => {
        console.error("Error reading images:", error);
        setImageErrors("Failed to read images");
      });
  };

  // Giao diện chung cho Card
  const renderCardContent = () => (
    <Card
      className="w-full max-w-sm shadow-xl hover:shadow-2xl cursor-pointer"
      onClick={handleCardClick}
    >
      {!course.image ||
      !Array.isArray(course.image) ||
      course.image.length === 0 ? (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-2xl">
          No image
        </div>
      ) : (
        <img
          src={course.image[0]}
          alt="Course Cover"
          className="w-full h-48 object-cover rounded-t-2xl"
        />
      )}
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-black">
          {course.coursename}
        </h2>
        <p className="text-gray-600 text-sm">{course.description}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-red-500 text-sm font-semibold">
            {course.is_special ? "Special Course" : ""}
          </p>
          <div className="text-right text-blue-600 font-bold">
            ${course.price}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mt-4">
      {renderCardContent()}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{course.coursename}</h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setOpen(false);
                setImageErrors("");
              }}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
          {!course.image ||
          !Array.isArray(course.image) ||
          course.image.length === 0 ? (
            <div className="h-96 bg-gray-200 flex items-center justify-center rounded mb-6">
              No image
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-center relative mb-6">
              <button
                onClick={handlePrevImage}
                className="absolute left-0 bg-white p-2 rounded-full shadow-md border border-gray-300 hover:bg-blue-100"
                aria-label="Previous image"
              >
                <ArrowLeft size={24} />
              </button>
              <img
                src={course.image[currentImageIndex]}
                alt={`Course ${currentImageIndex + 1}`}
                className="h-96 object-contain rounded"
              />
              <button
                onClick={handleNextImage}
                className="absolute right-0 bg-white p-2 rounded-full shadow-md border border-gray-300 hover:bg-blue-100"
                aria-label="Next image"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          )}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {imageErrors && (
                  <p className="text-red-500 text-sm">{imageErrors}</p>
                )}
                {(editedCourse.image.length > 0 ||
                  (editedCourse.newImages &&
                    editedCourse.newImages.length > 0)) && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {editedCourse.image.map((img, idx) => (
                      <img
                        key={`existing-${idx}`}
                        src={img}
                        alt={`Existing ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ))}
                    {editedCourse.newImages &&
                      editedCourse.newImages.map((img, idx) => (
                        <img
                          key={`new-${idx}`}
                          src={img}
                          alt={`New ${idx + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">
                  {t("Course Name")}
                </label>
                <input
                  type="text"
                  name="coursename"
                  value={editedCourse.coursename}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  {t("description")}
                </label>
                <textarea
                  name="description"
                  value={editedCourse.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  {t("price")}
                </label>
                <input
                  type="number"
                  name="price"
                  value={editedCourse.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  {t("number_of_allocated_periods")}
                </label>
                <input
                  type="number"
                  name="numAllocatedPeriod"
                  value={editedCourse.numAllocatedPeriod}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  {t("ordering")}
                </label>
                <input
                  type="number"
                  name="ordering"
                  value={editedCourse.ordering}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={editedCourse.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">{t("Active")}</option>
                  <option value="inactive">{t("Inactive")}</option>
                </select>
              </div>
              {/* Catalog editing */}
              <div>
                <label className="block text-sm font-medium">
                  {t("Catalog")}
                </label>
                <select
                  name="catalog"
                  value={editedCourse.catalog || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("Select Catalog")}</option>
                  <option value="Languages">{t("Language")}</option>
                  <option value="Computing">{t("Computing")}</option>
                  <option value="None">{t("None")}</option>
                  <option value="Languages and Computing">
                    {t("Languages and Computing")}
                  </option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_special"
                    checked={editedCourse.is_special}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  {t("Special")}
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSave}
                >
                  {t("save")}
                </Button>
                <Button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300"
                  onClick={handleCancel}
                  variant="outline"
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                <strong>{t("description")}:</strong> {course.description}
              </p>
              <p>
                <strong>{t("price")}:</strong> ${course.price}
              </p>
              <p>
                <strong>{t("number_of_allocated_periods")}:</strong>{" "}
                {course.numAllocatedPeriod}
              </p>
              <p>
                <strong>{t("ordering")}:</strong> {course.ordering}
              </p>
              <p>
                <strong>{t("Catalog")}:</strong> {course.catalog}
              </p>
              <div className="flex justify-between items-center">
                <p>
                  <strong>{t("status")}:</strong> {t(`${course.status}`)}
                </p>
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleEdit}
                >
                  {t("edit")}
                </Button>
              </div>
              {course.is_special && (
                <p className="text-red-500 font-semibold">{t("Special")}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CourseList = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [catalog, setCatalog] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Giới hạn 6 khóa học mỗi trang
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchCoursesWithFilter({
          page,
          limit,
          name: searchTerm,
          status:
            filter === "active" || filter === "inactive" ? filter : undefined,
          is_special:
            filter === "special"
              ? true
              : filter === "non-special"
              ? false
              : undefined,
          catalog: catalog || undefined,
        });

        setCourses(response.data || []);
        setFilteredCourses(response.data || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    loadData();
  }, [page, limit, searchTerm, filter, catalog]);

  const handleUpdateCourse = (updatedCourse) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === updatedCourse._id ? updatedCourse : course
      )
    );
    setFilteredCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === updatedCourse._id ? updatedCourse : course
      )
    );
  };

  const validateNewCourse = () => {
    const newErrors = {};
    if (!newCourse.coursename.trim()) {
      newErrors.coursename = "Course name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCourse = async () => {
    try {
      if (!validateNewCourse()) {
        return;
      }

      let imageUrls = [];
      if (newCourse.image.length > 0) {
        const uploadResult = await uploadImages(newCourse.image, true);
        imageUrls = uploadResult.imageUrls || [];
      }

      const courseData = {
        ...newCourse,
        image: imageUrls,
      };

      const result = await createCourse(courseData);

      setCourses((prev) => [...prev, courseData]);
      setNewCourse({
        coursename: "",
        description: "",
        price: 0,
        numAllocatedPeriod: 0,
        ordering: 0,
        status: "active",
        is_special: false,
        image: [],
        catalog: "",
      });
      setIsAddDialogOpen(false);
      setErrors({});
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to create course: " + error.message);
    }
  };

  const handleNewCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const [newCourse, setNewCourse] = useState({
    coursename: "",
    description: "",
    price: 0,
    numAllocatedPeriod: 0,
    ordering: 0,
    status: "active",
    is_special: false,
    image: [],
    catalog: "",
  });
  const [errors, setErrors] = useState({});

  return (
    <div className="container-fluid mt-4 px-3">
      <div className="flex items-center gap-4 flex-wrap mb-4 flex-md-nowrap align-items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder={t("searchCourses")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:text-black"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1); // Reset về trang 1 khi thay đổi filter
          }}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option value="all">{t("allCourses")}</option>
          <option value="active">{t("Active")}</option>
          <option value="inactive">{t("Inactive")}</option>
          <option value="special">{t("Special")}</option>
          <option value="non-special">{t("Non-Special")}</option>
        </select>
        <select
          value={catalog}
          onChange={(e) => {
            setCatalog(e.target.value);
            setPage(1); // Reset về trang 1 khi thay đổi catalog
          }}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option value="">{t("allCatalogs")}</option>
          <option value="Languages">{t("Languages")}</option>
          <option value="Computing">{t("Computing")}</option>
          <option value="None">{t("None")}</option>
          <option value="Languages and Computing">
            {t("Languages and Computing")}
          </option>
        </select>
        <Button
          className="btn btn-primary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          {t("addCourse")}
        </Button>
      </div>

      {/* Grid with 4 columns for CourseCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCourses.map((course) => (
          <div key={course._id}>
            <CourseCard course={course} onUpdate={handleUpdateCourse} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-4">
        <Button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          {t("previous")}
        </Button>
        <span className="text-black dark:text-white">
          {t("page")} {page} {t("of")} {totalPages}
        </span>
        <Button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          {t("next")}
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t("Add New Course")}</h2>
            <button
              onClick={() => setIsAddDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">{t("Images")}</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const readers = files.map((file) => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                  });

                  Promise.all(readers).then((images) => {
                    setNewCourse((prev) => ({
                      ...prev,
                      image: [...prev.image, ...images],
                    }));
                  });
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.image && (
                <p className="text-red-500 text-sm">{errors.image}</p>
              )}
            </div>
            {newCourse.image.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {newCourse.image.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">
                {t("Course Name")}
              </label>
              <input
                type="text"
                name="coursename"
                value={newCourse.coursename}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.coursename && (
                <p className="text-red-500 text-sm">{errors.coursename}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                {t("description")}
              </label>
              <textarea
                name="description"
                value={newCourse.description}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">{t("price")}</label>
              <input
                type="number"
                name="price"
                value={newCourse.price}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                {t("number_of_allocated_periods")}
              </label>
              <input
                type="number"
                name="numAllocatedPeriod"
                value={newCourse.numAllocatedPeriod}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                {t("Ordering")}
              </label>
              <input
                type="number"
                name="ordering"
                value={newCourse.ordering}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("Status")}</label>
              <select
                name="status"
                value={newCourse.status}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                {t("Catalog")}
              </label>
              <select
                name="catalog"
                value={newCourse.catalog}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("Select Catalog")}</option>
                <option value="Language">{t("Languages")}</option>
                <option value="Computing">{t("Computing")}</option>
                <option value="None">{t("None")}</option>
                <option value="Language and Computing">
                  {t("Language and Computing")}
                </option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_special"
                  checked={newCourse.is_special}
                  onChange={handleNewCourseChange}
                  className="mr-2"
                />
                Special Course
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button className="btn btn-primary" onClick={handleAddCourse}>
                {t("add")}
              </Button>
              <Button
                className="text-white border border-gray-300"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewCourse({
                    coursename: "",
                    description: "",
                    price: 0,
                    numAllocatedPeriod: 0,
                    ordering: 0,
                    status: "active",
                    is_special: false,
                    image: [],
                    catalog: "",
                  });
                  setErrors({});
                }}
                variant="outline"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseList;
