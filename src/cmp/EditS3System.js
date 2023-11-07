import React, { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { Password } from "primereact/password";

import axiosClient from "../util/axiosClient";
import SystemTypes from '../helper/system-types';

const EditS3System = ({ s3system, onClose, onS3SystemUpdated }) => {
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    type: "",
    accessKey: "",
    secretKey: "",
    endpoint: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(s3system);
  }, [s3system]);

  const handleUpdateS3System = async () => {
    try {
      const updatedS3System = {
        name: formData.name,
        type: formData.type,
        accessKey: formData.accessKey,
        secretKey: formData.secretKey,
        endpoint: formData.endpoint
      };

      await axiosClient.put(`/s3-systems/update/${formData._id}`, updatedS3System);
      onS3SystemUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating s3system:", error);
      setError(error.message || error?.error?.detailedMessage || error?.error?.message);
    }
  };

  return (
    <>
      <Dialog
        visible={true}
        style={{ width: "30vw" }}
        onHide={onClose}
        header="Edit S3 System"
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
              onClick={handleUpdateS3System}
            />
          </div>
        }
      >
        <form onSubmit={handleUpdateS3System} className="p-fluid">
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="name">S3 System name*</label>
            <InputText
              required={false}
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="type">Type* </label>
            <Dropdown
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={SystemTypes} 
              optionLabel="text"
              optionValue="value"
              placeholder="Select type" 
              className="w-full md:w-14rem" 
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="accesskey">Access key* </label>
            <InputText
              required={false}
              id="accesskey"
              value={formData.accessKey}
              onChange={(e) =>
                setFormData({ ...formData, accessKey: e.target.value })
              }
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="secretkey">Secret key*</label>
            <Password
              id="secretkey"
              value={formData.secretKey}
              onChange={(e) =>
                setFormData({ ...formData, secretKey: e.target.value })
              }
              toggleMask
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="endpoint">Endpoint* </label>
            <InputText
              required={false}
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) =>
                setFormData({ ...formData, endpoint: e.target.value })
              }
            />
          </div>
          <div>{error && <Message severity="error" text={error} />}</div>
        </form>
      </Dialog>
    </>
  );
};

export default EditS3System;
