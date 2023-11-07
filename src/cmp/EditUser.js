import React, { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

import axiosClient from "../util/axiosClient";
import { Container, Row, Col } from "react-grid-system";

const EditUser = ({ user, policies, onClose, onUserUpdated }) => {
  const [username, setUsername] = useState("");
  const [selectedPolicies, setSelectedPolicies] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(user.accessKey);
    setSelectedPolicies(
      user.policy && user.policy.length === 1 && user.policy[0] === ""
        ? null
        : user.policy || null
    );
  }, [user]);

  const handleUpdateUser = async () => {
    try {
      const updatedUser = {
        entityName: user.accessKey,
        entityType: "user",
        name: selectedPolicies,
      };

      await axiosClient.put(`set-policy`, updatedUser);
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error?.error?.detailedMessage || error?.error?.message);
    }
  };

  const handleChangePolicies = (e) => {
    setSelectedPolicies(e.value);
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
            <label htmlFor="policies">Policies</label>
            <MultiSelect
              id="policies"
              filter
              value={selectedPolicies}
              options={policies?.map((policy) => policy.name)}
              onChange={handleChangePolicies}
              placeholder={
                selectedPolicies?.length > 0
                  ? "Select policies"
                  : "No policies found"
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
