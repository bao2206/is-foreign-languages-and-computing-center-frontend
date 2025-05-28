import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}upload`;

// Hàm chuyển base64 thành File (tương thích trình duyệt)
const base64ToFile = (base64String, fileName = "image.png") => {
  // Xóa tiền tố "data:image/png;base64,"
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

  // Decode base64 thành dữ liệu nhị phân
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Tạo Blob từ byteArray
  const blob = new Blob([byteArray], { type: "image/png" });

  // Tạo File từ Blob
  return new File([blob], fileName, { type: "image/png" });
};

// Hàm upload chung cho cả file và base64
const uploadImages = async (input, isBase64 = false) => {
  try {
    // Kiểm tra input hợp lệ
    if (!input || (Array.isArray(input) && input.length === 0)) {
      throw new Error("No images provided");
    }

    // Chuẩn hóa input thành mảng files
    let files = [];
    if (isBase64) {
      console.log("Base64 images received:", input);
      files = Array.isArray(input)
        ? input.map((base64, index) =>
            base64ToFile(base64, `image_${index}.png`)
          )
        : [base64ToFile(input)];
    } else {
      console.log("Files received:", input);
      files = Array.isArray(input) ? input : [input];
    }

    console.log("Processed files:", files);

    // Tạo FormData
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`Appending file ${index}:`, file);
      formData.append("image", file);
    });

    // Log nội dung FormData
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry: ${key} =`, value);
    }

    // Gửi đến API
    const response = await axios.post(BASE_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading images:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export default uploadImages;
