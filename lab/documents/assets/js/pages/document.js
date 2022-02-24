"use strict";

import { validateFileInput, uploadDocuments } from "../upload.js";
import { fetchDocuments, deleteDocument, downloadDocument } from "../table.js";
import { FileTable } from "../../../../assets/js/components/file-table.js";
import "@gouvfr/dsfr/dist/component/component.min.css";
import "@gouvfr/dsfr/dist/component/upload/upload.min.css";
import "../../css/project-documents.css";

const projectId = parseInt(document.URL.split("/").reverse()[1]);
FileTable.init();
const documentTable = document.getElementById("document_list");
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

document
  .getElementById("upload-form")
  .addEventListener("uploadCompleted", () => {
    documentTable.toggleLoading(true);
    fetchDocuments(projectId);
  });

document
  .querySelector("form#upload-form")
  .addEventListener("change", validateFileInput);
document
  .querySelector("form#upload-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    event.target.querySelector("input[type='submit']").disabled = true;
    uploadDocuments(projectId);
  });
