import React, { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { useTranslation } from "react-i18next";

const ClassItem = (props) => {
  const { t } = useTranslation();
  const [classItem, setClassItem] = useState({
    _id: "",
    classname: "",
    courseId: {},
    teachers: [],
    quantity: 0,
    status: "",
    createdAt: "",
  }); // Destructure classItem from props, assuming it's passed as an object
  useEffect(() => {
    console.log("ClassItem props:", props.class);
    if (props.class) {
      setClassItem(props.class);
    } else {
      console.error("ClassItem props.class is undefined");
    }
  }, []);
  return (
    <div key={classItem._id} className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="border border-gray-300 rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold text-center">
          {classItem.classname}
        </h2>
        <p>
          {t("course")}: {classItem.courseId?.coursename || t("N/A")}
        </p>
        <p>
          {t("teachers")}:{" "}
          {classItem.teachers?.map((t) => t.name).join(", ") || t("N/A")}
        </p>
        <p>
          {t("quantity")}: {classItem.quantity}
        </p>
        <p>
          {t("status")}: {t(classItem.status)}
        </p>
        <p>
          {t("createdAt")}: {new Date(classItem.createdAt).toLocaleDateString()}
        </p>
        <div className="d-flex justify-content-end mt-2">
          <Button className="btn btn-outline-primary">{t("seeMore")}</Button>
        </div>
      </div>
    </div>
  );
};

export default ClassItem;
