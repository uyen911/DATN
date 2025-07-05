import { Modal, Button, Input, Flex } from "antd";
import React, { useState } from "react";

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");

  const handleApply = () => {
    onApply({ minAge, maxAge, minDiscount, maxDiscount });
    onClose();
  };

  return (
    <Modal
      title="Bộ Lọc"
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="apply" type="primary" onClick={handleApply}>
          Áp Dụng
        </Button>,
      ]}
    >
      <Flex wrap="wrap" gap="10px" align="center">
        <Input
          placeholder="Tuổi từ"
          value={minAge}
          onChange={(e) => setMinAge(e.target.value)}
          style={{ width: "150px", borderColor: "#93C5FD" }}
          type="number"
        />
        <Input
          placeholder="Tuổi đến"
          value={maxAge}
          onChange={(e) => setMaxAge(e.target.value)}
          style={{ width: "150px", borderColor: "#93C5FD" }}
          type="number"
        />
        <Input
          placeholder="Chiết khấu từ (%)"
          value={minDiscount}
          onChange={(e) => setMinDiscount(e.target.value)}
          style={{ width: "150px", borderColor: "#93C5FD" }}
          type="number"
        />
        <Input
          placeholder="Chiết khấu đến (%)"
          value={maxDiscount}
          onChange={(e) => setMaxDiscount(e.target.value)}
          style={{ width: "150px", borderColor: "#93C5FD" }}
          type="number"
        />
      </Flex>
    </Modal>
  );
};

export default FilterModal;