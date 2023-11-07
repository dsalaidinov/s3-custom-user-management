import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

import NewPolicy from "./NewPolicy";
import EditPolicy from "./EditPolicy";
import axiosClient from "../util/axiosClient";
import useToast from "./useToast";

const ListPolicies = () => {
  const [displayNewPolicyDialog, setDisplayNewPolicyDialog] = useState(false);
  const [displayEditPolicyDialog, setDisplayEditPolicyDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [toast, showError, showSuccess] = useToast();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axiosClient.get("/policies");
      const fetchedPolicies = response.data.policies;
      setPolicies(fetchedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const deletePolicy = async (name) => {
    try {
      await axiosClient.post("/remove-policy", { name });
      showSuccess(`Policy '${name}' removed successfully!`);
    } catch (error) {
      console.error(
        "Error removing policy:",
        error?.error?.detailedMessage || error?.error?.message
      );
      showError(
        `Error removing policy '${name}' ${
          error?.error?.detailedMessage ||
          error?.error?.message ||
          error?.details
        }`
      );
    }
  };

  const handleChangePassword = (policy) => {
    setDisplayEditPolicyDialog(true);
    setSelectedPolicy(policy);
  };

  const handleCloseEdit = () => {
    setSelectedPolicy(null);
  };

  const renderActions = (rowData) => {
    return (
      <div className="p-d-flex p-jc-between">
        {/* <Button
          icon="pi pi-pencil"
          style={{ marginRight: "1rem" }}
          className="p-button-rounded p-button-info p-button"
          onClick={() => handleChangePassword(rowData)}
        /> */}
        {/* <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deletePolicy(rowData.name)}
        /> */}
      </div>
    );
  };

  const policyTableHeader = (
    <div className="flex justify-between align-items-center gap-5 p-2">
      <h1 className="font-bold">Policies</h1>
      <Button
        label="Create New Policy"
        icon="pi pi-plus"
        size="small"
        className="p-button-success"
        onClick={() => setDisplayNewPolicyDialog(true)}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <div className="p-card p-shadow-4 content-container">
        {policyTableHeader}
        <DataTable value={policies} size="small" paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]} className="p-datatable-striped">
          <Column field="name" header="Name"></Column>
          {/* <Column field="policy" header="Policies"></Column>
        <Column field="memberOf" header="Groups"></Column> */}
          {/* <Column header="Actions" body={renderActions}></Column> */}
        </DataTable>

        <NewPolicy
          visible={displayNewPolicyDialog}
          onHide={() => setDisplayNewPolicyDialog(false)}
          onPolicyCreated={() => fetchPolicies()}
        />

        {selectedPolicy && (
          <EditPolicy
            policy={selectedPolicy}
            onClose={handleCloseEdit}
            onPolicyUpdated={fetchPolicies}
          />
        )}
      </div>
    </>
  );
};

export default ListPolicies;
