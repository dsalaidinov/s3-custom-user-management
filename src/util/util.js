import { ChonkyActions, ChonkyFileActionData } from 'chonky';
import Noty from 'noty';
// import 'noty/lib/noty.css';
// import 'noty/lib/themes/relax.css';
import React, { useMemo } from 'react';
// import './override.css';
import mc from "../util/mc";
import axiosClient from './axiosClient';

// We ignore some actions to avoid creating noise
const ignoredActions = new Set();
ignoredActions.add(ChonkyActions.MouseClickFile.id);
ignoredActions.add(ChonkyActions.KeyboardClickFile.id);
ignoredActions.add(ChonkyActions.StartDragNDrop.id);
ignoredActions.add(ChonkyActions.EndDragNDrop.id);
ignoredActions.add(ChonkyActions.ChangeSelection.id);

export const showActionNotification = (data) => {
  if (ignoredActions.has(data.action.id)) return;

  const textParts = [];
  textParts.push(
    `<div class="noty-action">Action: <code>${data.action.id}</code></div>`
  );

  if (data.id === ChonkyActions.OpenFiles.id) {
    const fileNames = data.payload.files.map((f) => `<code>${f.name}</code>`);
    if (fileNames.length === 1) {
      textParts.push('You opened a single file:');
    } else {
      textParts.push(`You opened ${fileNames.length} files:`);
    }
    textParts.push(...fileNames);
  }

  if (data.id === ChonkyActions.MoveFiles.id) {
    const fileCount = data.payload.files.length;
    const countString = `${fileCount} file${fileCount !== 1 ? 's' : ''}`;
    const source = `<code>${data.payload.source?.name ?? '~'}</code>`;
    const destination = `<code>${data.payload.destination.name}</code>`;
    textParts.push(`You moved ${countString} from ${source} to ${destination}.`);
  }

  if (data.id === ChonkyActions.DeleteFiles.id) {
    const fileCount = data.state.selectedFilesForAction.length;
    const countString = `${fileCount} file${fileCount !== 1 ? 's' : ''}`;
    textParts.push(`You deleted ${countString} files.`);
  }

  const text = textParts[0] + textParts.slice(1).join('<br/>');

  new Noty({
    text,
    type: 'success',
    theme: 'relax',
    timeout: 3000,
  }).show();
};

const GIT_BRANCH = 'master';
export const StoryLinkData = {
  name: '',
  url: '',
  docsUrl: '',
  gitPath: '',
};


export const downloadFile = async (bucket, path, s3System, userId, contentType) => {
  try {
    console.log('start downloading', path);

    const response = await axiosClient.get(`/buckets/download`, {
      params: {
        bucketName: bucket,
        objectKey: path,
        userId,
        s3System
      },
      responseType: 'blob',
    });


    const blob = new Blob([response.data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', path.split('/').pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('File downloaded successfully');
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

export const uploadFile = (bucket, path, file) => {
  mc.putObject(bucket, path, file, function (err, etag) {
    if (err) {
      console.log("err", err);
      return;
    }
    console.log("File uploaded successfully");
  });
};

export const getFileExtension = (fileName) => {
  let fileExtension;
  fileExtension = fileName?.replace(/^.*\./, '');
  return fileExtension;
}

export const isImage = (fileName) => {
  const fileExt = getFileExtension(fileName);
  const imagesExtension = ["png", "jpg", "jpeg"];

  if (imagesExtension.indexOf(fileExt) !== -1) {
    return true;
  } else {
    return false;
  }
}

export const formatFileSize = (bytes) => {
  if (bytes == 0) return '0 Bytes';
  const k = 1000,
    dm = 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const getFileData = async (bucket, path, s3System, userId, callback, progressCallback) => {
  try {
    const response = await axiosClient.get(`/buckets/preview`, {
      params: {
        bucketName: bucket,
        objectKey: path,
        userId,
        s3System,
      },
      onDownloadProgress: (progressEvent) => {
        console.log(progressEvent);
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(progress);
        progressCallback(progress);
      },
    });

    const uint8Array = new Uint8Array(response?.data?.map((chunk) => chunk.data).flat());
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });

    if (path.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = function () {
        const textData = reader.result;
        callback(textData);
      };
      reader.readAsText(blob);
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
      const url = URL.createObjectURL(blob);
      const image = document.getElementById('preview');
      if (image) {
        image.src = url;
      }
    } else if (path.endsWith('.mp4') || path.endsWith('.avi')) {
      const video = document.createElement('video');
      video.controls = true;
      video.src = URL.createObjectURL(blob);
      const container = document.getElementById('previewVideoContainer');
      if (container) {
        container.innerHTML = '';
        container.appendChild(video);
      }
    } else if (path.endsWith('.pdf')) {
      const embed = document.createElement('embed');
      embed.src = URL.createObjectURL(blob);
      embed.type = 'application/pdf';
      embed.width = '100%';
      embed.height = '100%';
      const container = document.getElementById('previewContainer');
      if (container) {
        container.innerHTML = '';
        container.appendChild(embed);
      }
    }
  } catch (error) {
    console.error('Error fetching file data:', error);
  }
};
