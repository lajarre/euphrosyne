/**
 * Handles file upload to s3 bucket
 */
"use strict";
import { fetchUploadPresignedUrl } from "../presigned-url-service.js";
import { uploadObject } from "../s3-service.js";
import { displayMessage } from "../../../assets/js/utils.js";

const FILES_MAX_SIZE = 30 * 1024 * 1000; // 30 MB
const MAX_SIZE_FORMATTED = "30 MB";
const ALLOWED_FILE_FORMATS = [
  "7z",
  "csv",
  "dat",
  "db",
  "dbf",
  "doc",
  "docx",
  "jpeg",
  "jpg",
  "heif",
  "log",
  "ods",
  "odt",
  "opd",
  "pdf",
  "png",
  "ppt",
  "pptx",
  "rar",
  "raw",
  "rtf",
  "sql",
  "svg",
  "tar.gz",
  "tiff",
  "txt",
  "wps",
  "wks",
  "wpd",
  "xls",
  "xlsx",
  "xml",
  "zip",
];
export class FileUploadForm extends HTMLFormElement {
  static init() {
    customElements.define("file-upload-form", FileUploadForm, {
      extends: "form",
    });
  }

  constructor() {
    super();
    this.addEventListener("change", this.validateFileInput);
    this.addEventListener("submit", (event) => {
      event.preventDefault();
      event.target.querySelector("input[type='submit']").disabled = true;
      this.uploadDocuments();
    });
  }

  async uploadDocuments() {
    const projectId = this.getAttribute("project-id");
    let response;
    try {
      response = await fetchUploadPresignedUrl(projectId);
    } catch (error) {
      displayMessage(
        window.gettext(
          "An error has occured while generating the presigned URL. Please contact the support team."
        ),
        "error"
      );
      this.querySelector("input[type='submit']").disabled = false;
      throw error;
    }
    this.handlePresignedURLResponse(response);
  }

  validateFileInput(event) {
    const fileInput = event.target;
    const { files } = fileInput;
    const totalSize = Array.from(files)
      .map((file) => file.size)
      .reduce((size, nextSize) => size + nextSize);

    if (totalSize > FILES_MAX_SIZE) {
      fileInput.setCustomValidity(
        window.interpolate(
          window.gettext("Total file sizes must not exceed %s."),
          [MAX_SIZE_FORMATTED]
        )
      );
      return;
    } else {
      fileInput.setCustomValidity("");
    }
    const notSupportedFormats = Array.from(files)
      .map((file) => file.name.split(".").pop()?.toLowerCase())
      .filter((format) => ALLOWED_FILE_FORMATS.indexOf(format) === -1);
    if (notSupportedFormats.length > 0) {
      fileInput.setCustomValidity(
        window.interpolate(
          window.gettext("The following file formats are not accepted : %s"),
          [notSupportedFormats.join(", ")]
        )
      );
      return;
    } else {
      fileInput.setCustomValidity("");
    }
  }

  async handlePresignedURLResponse(response) {
    /**
     * On server response, uses the presigned URL to upload files
     * to s3 bucket. Displays messages to user on success / error.
     */
    const { url, fields } = response;
    const files = document.querySelector("input[type='file']").files;

    const results = await Promise.all(
      Array.from(files).map((file) => {
        const { name } = file;
        return uploadObject(file, url, fields)
          .then(() => {
            this.dispatchEvent(
              new CustomEvent("upload-success", {
                detail: { name },
              })
            );
            return true;
          })
          .catch(() => {
            this.dispatchEvent(
              new CustomEvent("upload-error", {
                detail: { name },
              })
            );
            return false;
          });
      })
    );
    if (results.indexOf(true) !== -1) {
      this.dispatchEvent(new Event("upload-completed"));
    }
    this.querySelector("input[type='submit']").disabled = false;
    this.reset();
  }
}
