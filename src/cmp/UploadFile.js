import React from "react";
import { useState } from "react";
import mc from "../util/mc";
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from "primereact/toast";
import { ProgressBar } from 'primereact/progressbar';
import useToast from "../cmp/useToast";
let fileReaderStream = require("filereader-stream");

const UploadFile = ({ bucketName, pathPrefix = "", onRefresh, visible, setOpened }) => {
  const [value, setValue] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (event) => {
    setValue(event.target.files);
  };

  const [toast, showError, showSuccess] = useToast();

  // eslint-disable-next-line no-unused-vars
  const [targetPrefix, setTargetPrefix] = useState(pathPrefix);

  const uploadFiles = () => {
    const filesList = Array.from(value);
    setUploadProgress(1);

    filesList.map(async (file) => {
      const { name: fileName } = file;

      let readStream = fileReaderStream(file);
      console.log("targetPrefix", targetPrefix)
      mc.putObject(
        bucketName,
        `${pathPrefix ? pathPrefix : ""}${fileName}`,
        readStream,
        {
          "Content-Type": file.type,
          "X-Amz-Meta-App": "SPH-REACT-JS",
        },
        (error, data) => {
          if (error) {
            setOpened(false);
            showError(error.message);
            console.log(error);
          } else {
            setUploadProgress(0);
            showSuccess(`Successfully uploaded ${fileName}`);
            onRefresh();
          }
        }
      );
    });

  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const files = event.dataTransfer.files;
    setValue(files);
  };

  const handleOnHide = () => {
    setOpened(false);
    setValue([]);
  }

  return (
    <>
      <Dialog
        header="Upload files"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={handleOnHide}
      >
        <Toast ref={toast} />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            uploadFiles();
          }}

        >
          <div className="flex flex-col gap-3 ">
            {value.length ? <Message severity="success" text="File added" /> : ''}
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    aria-hidden="true"
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <input
                  hidden
                  id="dropzone-file"
                  type="file"
                  multiple
                  onChange={handleChange}
                />
              </label>
            </div>

            {uploadProgress ? <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar> : ''}

            <div className="flex items-center justify-center">
              <Button
                label="Upload"
                disabled={Number(value.length) === 0}
                type="submit"
                className="h-12 bg-blue-800 border border-gray-100 w-24 text-white rounded"
              />

            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default UploadFile;
