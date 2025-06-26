import React, { useState, useEffect } from "react";

const AssignmentEditModal = ({
  open,
  onClose,
  assignment,
  classes,
  onSave,
  t,
}) => {
  const [form, setForm] = useState({
    _id: "",
    title: "",
    description: "",
    dueDate: "",
    classId: "",
  });

  useEffect(() => {
    if (assignment) {
      setForm({
        _id: assignment._id || "",
        title: assignment.title || "",
        description: assignment.description || "",
        dueDate: assignment.dueDate
          ? new Date(assignment.dueDate).toISOString().slice(0, 16)
          : "",
        classId: assignment.classId?._id || assignment.classId || "",
      });
    }
  }, [assignment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate || !form.classId) {
      alert(t("all_fields_required"));
      return;
    }
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t("edit_assignment")}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("title")}
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("due_date")}
            </label>
            <input
              type="datetime-local"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("class")}
            </label>
            <select
              name="classId"
              value={form.classId}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">{t("select_a_class")}</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.classname}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {t("edit_assignment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentEditModal;
