"use strict";

import { displayMessage } from "../../../../assets/js/utils.js";
import { FileTable } from "../../../../assets/js/components/file-table.js";
import { FileUploadForm } from "../../../../assets/js/components/file-upload-form.js";

import "@gouvfr/dsfr/dist/component/component.min.css";
import "@gouvfr/dsfr/dist/component/upload/upload.min.css";

FileTable.init();
FileUploadForm.init();

const rawDataTable = document.getElementById("raw-data-table");
const processedDataTable = document.getElementById("processed-data-table");
const rawDataUploadForm = document.getElementById("raw-data-upload-form");

window.addEventListener("DOMContentLoaded", () => {
  rawDataTable.toggleLoading(true);
  processedDataTable.toggleLoading(true);
});

rawDataUploadForm.addEventListener("upload-completed", () => {
  rawDataTable.toggleLoading(true);
});
rawDataUploadForm.addEventListener("upload-success", (event) => {
  const { name } = event.detail;
  displayMessage(
    window.interpolate(window.gettext("File %s has been uploaded."), [name]),
    "success"
  );
});
rawDataUploadForm.addEventListener("upload-error", (event) => {
  const { name } = event.detail;

  displayMessage(
    window.interpolate(window.gettext("File %s could not be uploaded."), [
      name,
    ]),
    "error"
  );
});
