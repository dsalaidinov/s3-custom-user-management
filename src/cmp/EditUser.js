import React, { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

import axiosClient from "../util/axiosClient";
import { Container, Row, Col } from "react-grid-system";

const EditUser = ({ user, s3systems, onClose, onUserUpdated }) => {
  const [username, setUsername] = useState("");
  const [selectedS3Systems, setSelectedS3Systems] = useState(null);
  const [error, setError] = useState("");
console.log(user);
  useEffect(() => {
    setUsername(user.username);
    setSelectedS3Systems(user.s3systems);
  }, [user]);

  const handleUpdateUser = async () => {
    try {
      const updatedUser = {
        s3systems: selectedS3Systems,
      };

      await axiosClient.put(`/users/update/${user._id}`, updatedUser);
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error?.error?.detailedMessage || error?.error?.message);
    }
  };

  const handleChangeS3Policies = (e) => {
    console.log(e);
    setSelectedS3Systems(e.value);
  };

  return (
    <>
      <Dialog
        visible={true}
        style={{ width: "30vw" }}
        onHide={onClose}
        header="Edit User"
        footer={
          <div className="p-d-flex p-jc-between">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onClose}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleUpdateUser}
            />
          </div>
        }
      >
        <Container>
          <Row style={{ marginBottom: "1rem" }}>
            <Col xs={12}>
              <div className="p-field">
                <label htmlFor="username" className="text-1xl font-bold">
                  Username: {username}
                </label>
              </div>
            </Col>
          </Row>

          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="s3systems">S3 Systems</label>
            <MultiSelect
              id="s3systems"
              filter
              value={selectedS3Systems}
              options={s3systems}
              optionValue="_id"
              optionLabel="name"
              onChange={handleChangeS3Policies}
              placeholder={
                s3systems?.length > 0
                  ? "Select s3 system"
                  : "No s3 system found"
              }
              maxSelectedLabels={3}
              className="w-full md:w-20rem"
            />
          </div>
          <div>{error && <Message severity="error" text={error} />}</div>
        </Container>
      </Dialog>
    </>
  );
};

export default EditUser;
