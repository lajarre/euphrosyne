"use strict";

import "@gouvfr/dsfr/dist/component/component.min.css";
import "@gouvfr/dsfr/dist/component/upload/upload.min.css";

import { FileTable } from "../../../../assets/js/components/file-table.js";
import { FileUploadForm } from "../../../../assets/js/components/file-upload-form.js";
import { FileManager } from "../../../../assets/js/file-manager.js";
import { PresignedUrlService } from "../presigned-url-service.js";
import { S3Service } from "../../../../assets/js/s3-service.js";

FileTable.init();
FileUploadForm.init();

const projectId = parseInt(document.URL.split("/").reverse()[1]);

const presignedUrlService = new PresignedUrlService(projectId);
const s3Service = new S3Service(presignedUrlService);

const documentTable = document.getElementById("document_list");
const documentForm = document.getElementById("upload-form");

const fileManager = new FileManager(
  documentForm,
  documentTable,
  presignedUrlService,
  s3Service
);

documentTable.addEventListener("download-click", (e) => {
  const { key } = e.detail;
  fileManager.downloadFile(key);
});
documentTable.addEventListener("delete-click", (e) => {
  const { key } = e.detail;
  fileManager.deleteFile(key);
});

documentForm.addEventListener("submit", (event) => {
  const { files } = event.target.elements.namedItem("files");
  fileManager.uploadFiles(files);
});
documentForm.addEventListener("upload-completed", () => {
  fileManager.fetchFiles();
});

window.addEventListener("DOMContentLoaded", () => {
  fileManager.fetchFiles();
});
