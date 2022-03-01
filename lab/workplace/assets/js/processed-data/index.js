"use strict";

import { FileManager } from "../../../../assets/js/file-manager.js";
import { S3Service } from "../../../../assets/js/s3-service.js";

import { PresignedUrlService } from "./presigned-url-service.js";

export function initProcessedData() {
  const presignedUrlService = new PresignedUrlService();
  const s3Service = new S3Service(presignedUrlService);

  const fileTable = document.getElementById("processed-data-table");
  const fileForm = document.getElementById("processed-data-upload-form");

  const fileManager = new FileManager(
    fileForm,
    fileTable,
    presignedUrlService,
    s3Service
  );

  const projectId = parseInt(document.URL.split("/").reverse()[1]);

  fileTable.addEventListener("download-click", (e) => {
    const { key } = e.detail;
    fileManager.downloadFile(projectId, key);
  });
  fileTable.addEventListener("delete-click", (e) => {
    const { key } = e.detail;
    fileManager.deleteFile(projectId, key);
  });

  fileForm.addEventListener("submit", (event) => {
    const { files } = event.target.elements.namedItem("files");
    fileManager.uploadFiles(projectId, files);
  });

  window.addEventListener("DOMContentLoaded", () => {
    fileTable.toggleLoading(true);
    fileManager.fetchFiles(projectId);
  });
}
