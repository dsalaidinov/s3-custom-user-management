import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from 'primereact/dropdown';

import useToast from "../cmp/useToast";
import axiosClient from "../util/axiosClient";
import SystemTypes from '../helper/system-types';

const NewS3System = ({ visible, onHide, onS3SystemCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    accessKey: "",
    secretKey: "",
    endpoint: ""
  });

  const [toast, , showSuccess] = useToast();
  const [error, setError] = useState("");

  const handleHide = () => {
    setFormData({
      name: "",
      type: "",
      accessKey: "",
      secretKey: "",
      endpoint: ""
    });
    onHide();
    setError("");
  };

  const onSubmit = async (e) => {
    console.log(e);
    e.preventDefault();

    try {
      await axiosClient.post("/s3-systems/create", {
        ...formData
      });
      onHide();
      onS3SystemCreated();
      setFormData({
        name: "",
        type: "",
        accessKey: "",
        secretKey: "",
        endpoint: ""
      });
      setError("");
      showSuccess(`S3 System created successfully!`);
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
        label="Create S3System"
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
        header="Create New S3System"
        footer={dialogFooter}
      // className="h-full"
      >
        <form onSubmit={onSubmit} className="p-fluid">
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

export default NewS3System;
