import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Tag } from 'primereact/tag';
import mc from "../util/mc";

import NewS3System from "./NewS3System";
import EditS3System from "./EditS3System";
import axiosClient from "../util/axiosClient";
import useToast from "./useToast";

const ListS3Systems = () => {
  const [displayNewS3SystemDialog, setDisplayNewS3SystemDialog] = useState(false);
  const [displayEditS3SystemDialog, setDisplayEditS3SystemDialog] = useState(false);
  const [selectedS3System, setSelectedS3System] = useState(null);
  const [toast, showError, showSuccess] = useToast();
  const [s3systems, setS3Systems] = useState([]);

  useEffect(() => {
    fetchS3Systems();
  }, []);

  const fetchS3Systems = async () => {
    try {
      const response = await axiosClient.get("/s3systems/list");
      const fetchedS3Systems = response.data;
      setS3Systems(fetchedS3Systems);
    } catch (error) {
      console.error("Error fetching S3 systems:", error);
    }
  };

  const deleteS3System = async (accessKey) => {
    try {
      await axiosClient.post("/remove-s3system", { accessKey });
      showSuccess(`S3 system '${accessKey}' removed successfully!`);
    } catch (error) {
      console.error(
        "Error removing S3 system:",
        error?.error?.detailedMessage || error?.error?.message
      );
      showError(
        `Error removing S3 system '${accessKey}' ${
          error?.error?.detailedMessage ||
          error?.error?.message ||
          error?.details
        }`
      );
    }
  };

  const handleEditS3System = (s3system) => {
    console.log(s3system)
    setDisplayEditS3SystemDialog(true);
    setSelectedS3System(s3system);
  };

  const handleCloseEdit = () => {
    setSelectedS3System(null);
  };

  const renderActions = (rowData) => {
    return (
      <div className="p-d-flex p-jc-between">
        <Button
          icon="pi pi-cog"
          style={{ marginRight: "1rem" }}
          className="p-button-rounded p-button-info p-button"
          onClick={() => handleEditS3System(rowData)}
        />
        {/* <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteS3System(rowData.accessKey)}
        /> */}
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status} severity={getStatus(rowData)}></Tag>;
  };

  const getStatus = (user) => {
    switch (user.inventoryStatus) {
        case 'enabled':
            return 'success';

        case 'disabled':
            return 'warning';

       default:
            return null;
    }
};

  const onS3SystemUpdated = () => {
    showSuccess(`S3System updated successfully!`);
    fetchS3Systems();
  }

  const userTableHeader = (
    <div className="flex justify-between gap-5 p-2">
      <h1 className="font-bold">S3 Systems</h1>
      <div>
        <Button
          icon="pi pi-refresh"
          rounded='true'
          raised='true'
          onClick={() => fetchS3Systems()}
          style={{ marginRight: "0.25rem" }}
        />
        <Button
          label="Add new S3 system"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => setDisplayNewS3SystemDialog(true)}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <div className="p-card p-shadow-4 content-container">
        {userTableHeader}
        <DataTable
          value={s3systems}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          size="small"
          className="p-datatable-striped"
        >
          <Column field="name" sortable style={{ width: '25%' }} header="Name"></Column>
          <Column field="type" sortable style={{ width: '25%' }} header="Type"></Column>
          <Column field="accessKey" sortable style={{ width: '25%' }} header="Access Key"></Column>
          <Column field="secretKey" sortable style={{ width: '25%' }} header="Secret Key"></Column>
          <Column field="endpoint" sortable style={{ width: '40%' }} header="End point"></Column>
          <Column header="Actions" body={renderActions} style={{ minWidth: '10rem' }}></Column>
        </DataTable>


        <NewS3System
          visible={displayNewS3SystemDialog}
          onHide={() => setDisplayNewS3SystemDialog(false)}
          onS3SystemCreated={() => fetchS3Systems()}
        />

        {selectedS3System && (
          <EditS3System
            s3system={selectedS3System}
            onClose={handleCloseEdit}
            onS3SystemUpdated={onS3SystemUpdated}
          />
        )}
      </div>
    </>
  );
};

export default ListS3Systems;
