"use strict";

import { fetchDocuments, deleteDocument, downloadDocument } from "../table.js";
import { displayMessage } from "../../../../assets/js/utils.js";
import { FileTable } from "../../../../assets/js/components/file-table.js";
import { FileUploadForm } from "../../../../assets/js/components/file-upload-form.js";
import "@gouvfr/dsfr/dist/component/component.min.css";
import "@gouvfr/dsfr/dist/component/upload/upload.min.css";
import "../../css/project-documents.css";

FileTable.init();
FileUploadForm.init();

const documentTable = document.getElementById("document_list");
const fileUploadForm = document.getElementById("upload-form");

const projectId = parseInt(document.URL.split("/").reverse()[1]);
documentTable.addEventListener("download-click", (e) => {
  const { projectId, key } = e.detail;
  downloadDocument(projectId, key);
});
documentTable.addEventListener("delete-click", (e) => {
  const { projectId, key } = e.detail;
  deleteDocument(projectId, key);
});

window.addEventListener("DOMContentLoaded", () => {
  documentTable.toggleLoading(true);
  fetchDocuments(projectId);
});

fileUploadForm.addEventListener("upload-completed", () => {
  documentTable.toggleLoading(true);
  fetchDocuments(projectId);
});
fileUploadForm.addEventListener("upload-success", (event) => {
  const { name } = event.detail;
  displayMessage(
    window.interpolate(window.gettext("File %s has been uploaded."), [name]),
    "success"
  );
});
fileUploadForm.addEventListener("upload-error", (event) => {
  const { name } = event.detail;

  displayMessage(
    window.interpolate(window.gettext("File %s could not be uploaded."), [
      name,
    ]),
    "error"
  );
});
