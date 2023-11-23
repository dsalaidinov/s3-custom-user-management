import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { ScrollPanel } from 'primereact/scrollpanel';
import { ProgressBar } from 'primereact/progressbar';

import { isImage, formatFileSize } from "../util/util";
import { downloadFile, getFileData } from "../util/util";

const FileDetailsDialog = ({ bucket, path, visible, onHide, file }) => {
  const url = `${path}${file?.name}`;
  const [fileData, setFileData] = useState(null);
  const [progress, setProgress] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'))?.user;
  const isAdmin = user.role === "admin";
  const systemId = isAdmin ? localStorage.getItem("s3system") : user.s3systems;

  const handleReadFile = (data) => {
    setFileData(data);
  }

  const handleProgress = (progress) => {
    setProgress(progress);
  }

  useEffect(() => {
    if (!file?.isDir) {
      visible && getFileData(bucket, url, systemId, user._id, handleReadFile, handleProgress);
    }
  }, [bucket, url, file, visible]);

  const handleOnHide = () => {
    onHide();
    setFileData(null);
    setProgress(0);
  }

  return (
    <Dialog
      header="Object Details"
      visible={visible}
      style={{ width: '50vw' }}
      onHide={handleOnHide}
      maximizable
    >
      <div>
        <div className="mb-2">
          <h2>Name: {file?.name}</h2>
          <h2>Size: {formatFileSize(file?.size)}</h2>
          <h2>Modified on: {file?.lastModified}</h2>
          <h2>Bucket: {bucket}</h2>
        </div>

        { (
          <div className="p-progress">
            <div className="p-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <Button
          style={{ backgroundColor: '#277cbc' }}
          onClick={() => downloadFile(bucket, url, systemId, user._id)}
          icon="pi pi-download" iconPos="right"
        />

        {progress ? <ProgressBar value={progress}></ProgressBar> : ''}

        {!file?.isDir && isImage(file?.name) && (
          <div className="flex mt-3" style={{ textAlign: "center", justifyContent: "center" }} >
            <img id="preview" width="400" src={url} alt={file?.name} />
          </div>
        )}

        {!file?.isDir && !isImage(file?.name) && fileData && (
          <Panel header={`File Content ${file?.name}`} className="mt-3">
            <ScrollPanel style={{ height: '400px' }}>
              <div dangerouslySetInnerHTML={{ __html: fileData }} />
            </ScrollPanel>
          </Panel>
        )}

        {file && (
          <div id="previewVideoContainer" className="mt-3"></div>
        )}

        {file && (
          <div id="previewContainer" className="mt-3"></div>
        )}
      </div>
    </Dialog>
  );
};

export default FileDetailsDialog;