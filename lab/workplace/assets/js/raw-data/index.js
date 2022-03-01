"use strict";

import { FileManager } from "../../../../assets/js/file-manager.js";
import { S3Service } from "../../../../assets/js/s3-service.js";

import { PresignedUrlService } from "./presigned-url-service.js";

export function initRawData() {
  const projectId = parseInt(document.URL.split("/").reverse()[1]);

  window.runIds.forEach((runId) => {
    const presignedUrlService = new PresignedUrlService(projectId, runId),
      s3Service = new S3Service(presignedUrlService);

    const fileTable = document.getElementById(`run-${runId}-raw-data-table`),
      fileForm = document.getElementById(`run-${runId}-raw-data-upload-form`);

    const fileManager = new FileManager(
      fileForm,
      fileTable,
      presignedUrlService,
      s3Service
    );

    fileTable.addEventListener("download-click", (e) => {
      const { key } = e.detail;
      fileManager.downloadFile(key);
    });
    fileTable.addEventListener("delete-click", (e) => {
      const { key } = e.detail;
      fileManager.deleteFile(key);
    });

    fileForm.addEventListener("submit", (event) => {
      const { files } = event.target.elements.namedItem("files");
      fileManager.uploadFiles(files);
    });
    fileForm.addEventListener("upload-completed", () => {
      fileManager.fetchFiles();
    });

    window.addEventListener("DOMContentLoaded", () => {
      fileManager.fetchFiles();
    });
  });
}
