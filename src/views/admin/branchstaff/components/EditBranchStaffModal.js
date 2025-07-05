import React, { useState } from "react";
import { removeStaffFromBranch } from "services/branchStaffService";

const EditBranchStaffModal = ({ branchId, staffList, onClose, onSuccess }) => {
  const [userIds, setUserIds] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userIds) {
      setMessage("Vui lòng nhập User IDs.");
      return;
    }
    try {
      const userIdArray = userIds.split(",").map((id) => id.trim());
      const response = await removeStaffFromBranch(branchId, userIdArray);
      setMessage(response.message);
      onSuccess(); // Cập nhật danh sách sau khi xóa
      setUserIds(""); // Reset input
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "5px", width: "300px" }}>
        <h3>Chỉnh sửa nhân viên chi nhánh</h3>
        <form onSubmit={handleSubmit}>
          <label>User IDs để xóa:</label>
          <input
            type="text"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            placeholder="Nhập User IDs (cách nhau bằng dấu phẩy)"
            style={{ margin: "10px 0", padding: "5px", width: "100%" }}
          />
          <button type="submit" style={{ marginRight: "10px", padding: "5px 10px" }}>Xóa</button>
          <button type="button" onClick={onClose} style={{ padding: "5px 10px" }}>Đóng</button>
          {message && <p style={{ color: message.includes("Thành công") ? "green" : "red", marginTop: "10px" }}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default EditBranchStaffModal;