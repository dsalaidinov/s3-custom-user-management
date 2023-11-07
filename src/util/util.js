import { ChonkyActions, ChonkyFileActionData } from 'chonky';
import Noty from 'noty';
// import 'noty/lib/noty.css';
// import 'noty/lib/themes/relax.css';
import React, { useMemo } from 'react';
// import './override.css';
import mc from "../util/mc";

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

// export const useStoryLinks = (links) => {
//     return useMemo(() => {
//         const components = [];
//         for (let i = 0; i < links.length; ++i) {
//             const link = links[i];
//             let name = link.name;
//             let href = link.url;
//             if (link.docsUrl) {
//                 href = link.docsUrl;
//                 if (!name) name = 'Relevant docs';
//             } else if (link.gitPath) {
//                 href = getGitHubLink(link.gitPath);
//                 if (!name) name = 'Story source code';
//             } else if (!href) {
//                 throw new Error(`Link "${link.name}" has no URL specified!`);
//             }

//             components.push(
//                 <Button
//                     href={href}
//                     size="small"
//                     color="primary"
//                     target="_blank"
//                     variant="contained"
//                     key={`story-link-${i}`}
//                     rel="noreferrer noopener"
//                     style={{ marginBottom: 15, marginRight: 15 }}
//                 >
//                     {name}
//                 </Button>
//             );
//         }
//         return components;
//     }, [links]);
// };

export const downloadFile = (bucket, path, contentType) => {
    console.log('start downloading', path)
    mc.getObject(bucket, path, function (err, dataStream) {
      if (err) {
        console.log("err", err);
        return;
      }
      const chunks = [];
      dataStream.on("data", function (chunk) {
        chunks.push(chunk);
      });
      dataStream.on("end", function () {
        console.log("File downloaded successfully");
        const blob = new Blob(chunks, { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", path.split("/").pop());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      dataStream.on("error", function (err) {
        console.log(err);
      });
    });
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
  
  if(imagesExtension.indexOf(fileExt) !== -1){
      return true;
  } else{
      return false;
  }
}

export const formatFileSize = (bytes) => {
   if(bytes == 0) return '0 Bytes';
   const k = 1000,
       dm = 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const getFileData = (bucket, path, callback) => {
  mc?.getObject(bucket, path, function (err, dataStream) {
    if (err) {
      console.log("err", err);
      return;
    }
    const chunks = [];
    dataStream.on("data", function (chunk) {
      chunks.push(chunk);
    });
    dataStream.on("end", function () {
      const blob = new Blob(chunks, { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      if (path.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = function() {
          const textData = reader.result;
          callback(textData);
        };
        reader.readAsText(blob);
      } else {
        const image = document.getElementById("preview");
        if(image) {
          image.src = url;
        } 
      }
    });
    dataStream.on("error", function (err) {
      console.log(err);
    });
  });
}