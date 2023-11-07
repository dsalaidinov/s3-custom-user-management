import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";

import useToast from "../cmp/useToast";
import axiosClient from "../util/axiosClient";

const NewUser = ({ visible, onHide, onUserCreated }) => {
  const [selectedPolicies, setSelectedPolicies] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState(null);
  const [formData, setFormData] = useState({
    accesskey: "",
    secretkey: "",
    policies: [],
    groups: [],
  });

  const [toast, , showSuccess] = useToast();
  const [error, setError] = useState("");

  useEffect(() => {
    // fetchPolicies();
    // fetchGroups();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axiosClient.get("/policies");
      const fetchedPolicies = response.data.policies;
      setAllPolicies(fetchedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axiosClient.get("/groups");
      const fetchedGroups = response.data.groups;
      setAllGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const [allPolicies, setAllPolicies] = useState([]);

  const [allGroups, setAllGroups] = useState([""]);

  const handleHide = () => {
    setFormData({
      accesskey: "",
      secretkey: "",
      policies: [],
      groups: [],
    });
    onHide();
    setError("");
    setSelectedGroups(null);
    setSelectedPolicies(null);
  };

  const onSubmit = async (e) => {
    console.log(e);
    e.preventDefault();

    try {
      await axiosClient.post("/users", {
        ...formData,
        policies: selectedPolicies
          ? selectedPolicies.map((policy) => policy.name)
          : [""],
      });
      onHide();
      onUserCreated();
      setFormData({
        accesskey: "",
        secretkey: "",
        policies: [],
        groups: [],
      });
      setError("");
      showSuccess(`User created successfully!`);
    } catch (error) {
      setError(error?.error?.detailedMessage || error?.error?.message);
    }
  };

  const dialogFooter = (
    <div className="p-d-flex p-jc-between">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
      />
      <Button
        label="Create User"
        icon="pi pi-check"
        className="p-button-success"
        onClick={onSubmit}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        maximizable
        style={{ width: "50vw" }}
        onHide={handleHide}
        header="Create New User"
        footer={dialogFooter}
        // className="h-full"
      >
        <form onSubmit={onSubmit} className="p-fluid">
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="accesskey">Username (access key)*</label>
            <InputText
              required={false}
              id="accesskey"
              value={formData.accesskey}
              onChange={(e) =>
                setFormData({ ...formData, accesskey: e.target.value })
              }
            />
          </div>

          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="secretkey">Password (secret key)*</label>
            <Password
              id="secretkey"
              value={formData.secretkey}
              onChange={(e) =>
                setFormData({ ...formData, secretkey: e.target.value })
              }
              toggleMask
            />
          </div>

          <div
            className="card flex justify-content-center"
            style={{ marginBottom: "1rem" }}
          >
            <MultiSelect
              filter
              value={selectedPolicies}
              onChange={(e) => setSelectedPolicies(e.target.value)}
              options={allPolicies}
              optionLabel="name"
              placeholder="Select policies"
              maxSelectedLabels={3}
              className="w-full md:w-20rem"
            />
          </div>

          <div
            className="card flex justify-content-center"
            style={{ marginBottom: "1rem" }}
          >
            <MultiSelect
              value={selectedGroups}
              onChange={(e) => setSelectedGroups(e.target.value)}
              options={allGroups}
              placeholder="Select groups"
              maxSelectedLabels={3}
              className="w-full md:w-20rem"
            />
          </div>
          <div>{error && <Message severity="error" text={error} />}</div>
        </form>
      </Dialog>
    </>
  );
};

export default NewUser;
