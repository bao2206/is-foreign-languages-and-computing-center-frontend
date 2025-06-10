export default function CheckAndRemoveExpiredToken() {
  console.log("Checking and removing expired token...");

  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
    }
  } catch (e) {
    localStorage.removeItem("token");
  }
}
