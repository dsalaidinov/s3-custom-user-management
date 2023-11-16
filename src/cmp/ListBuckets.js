import React, { useEffect, useState } from "react";
import mc from "../util/mc";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import NewBucket from "./NewBucket";
import { Toast } from "primereact/toast";

import axiosClient from "../util/axiosClient";
import useToast from "./useToast";
import S3Browser from "./S3Browser";
import SelectS3System from "./SelectS3System";

const ListBuckets = () => {
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [toast, showError, showSuccess] = useToast();
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const user = localStorage.getItem('user');
  const userId = JSON.parse(user)?.user;
  const currentS3System = localStorage.getItem('s3system');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  const getBuckets = async(system = currentS3System) => {
    try {
    const res = await axiosClient.get(`/buckets/list-by-user?s3System=${system}`);
    setBuckets(res.data);
    } catch (error) {
      error && showError("Error: ", error?.error);
    }
  };

  const removeBucket = async (node) => {
    try {
      await mc.removeBucket(node.name);

      showSuccess("Successfully removed bucket");
    } catch (er) {
      showError("Tested Error:", er?.message);
      console.log("showError");
    }

    await getBuckets();
  };

  useEffect(() => {
    getBuckets();
  }, []);

  const handleSelectS3System = async (system) => {
    console.log(system);
    await getBuckets(system);
  };

  const bucketsTableHeader = () => {
    return (
      <div className="flex justify-between align-items-center gap-10">
        <h5 className="m-0">Buckets</h5>
        <div className="flex items-center gap-2">
          {<SelectS3System onSelect={handleSelectS3System} />}
          <button
            type="button"
            rounded
            raised
            style={{ backgroundColor: "#277cbc" }}
            className="px-2 h-8 border border-gray-100 text-white rounded"
            onClick={() => getBuckets()}
          >
            <i className="pi pi-refresh"></i>
          </button>
          {isAdmin && <NewBucket onRefresh={getBuckets} />}
        </div>
      </div>
    );
  };

  const actionTemplate = (node, column) => {
    return (
      <div className="flex gap-2">
        {/* <button
          type="button"
          className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"
          onClick={() => setShowPolicyForm(true)}
        >
          <i className="pi pi-lock"></i>
        </button> */}
        <button
          type="button"
          className="bg-white hover:bg-gray-200 flex items-center p-1 rounded"
          onClick={() => removeBucket(node)}
        >
          <i className="pi pi-trash"></i>
        </button>
      </div>
    );
  };

  const selectBucket = (bucket) => {
    setSelectedBucket(bucket.name);
  };

  const onHidePolicyForm = () => {
    setShowPolicyForm(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-1">
        <div className="buckets-container">
          <DataTable
            value={buckets}
            width="100%"
            style={{
              border: "1px solid #CECEEC",
              borderRadius: "5px",
            }}
            header={bucketsTableHeader}
            selectionMode="single"
            selection={selectedBucket}
            onSelectionChange={(e) => selectBucket(e.value)}
          >
            <Column
              field="name"
              width={"80%"}
              header="Name"
              body={(rowData) => (
                <button
                  type="button"
                  className="text-pink-700 underline hover:text-blue-800"
                  onClick={() => selectBucket(rowData)}
                >
                  {rowData.name}
                </button>
              )}
            />
            <Column
              body={actionTemplate}
              style={{ textAlign: "center", width: "80px" }}
            />
          </DataTable>
        </div>
        <div className="content-container">
          <S3Browser bucketName={selectedBucket || null} />
        </div>
      </div>
    </>
  );
};

export default ListBuckets;
