import { displayMessage } from "./utils.js";

export class FileManager {
  constructor(fileForm, fileTable, presignedUrlService, s3Service) {
    this.fileForm = fileForm;
    this.fileTable = fileTable;
    this.presignedUrlService = presignedUrlService;
    this.s3Service = s3Service;
  }

  async fetchFiles(projectId) {
    this.fileTable.toggleLoading(true);
    const keys = await this.s3Service.listObjectsV2(projectId);
    this.fileTable.updateFiles(keys);
  }

  async dowloadFile(projectId, key) {
    const url = await this.presignedUrlService.fetchDownloadPresignedURL(
      projectId,
      key
    );
    window.open(url, "_blank");
  }

  async deleteFile(projectId, key) {
    if (
      !window.confirm(
        window.interpolate(window.gettext("Delete the document %s ?"), [
          key.split("/").pop(),
        ])
      )
    ) {
      return;
    }
    this.fileTable.toggleLoading(true);
    try {
      await this.s3Service.deleteObject(projectId, key);
      this.handleDeleteSuccess(projectId, key);
    } catch (error) {
      this.handleDeleteError(key);
      throw error;
    }
  }

  async uploadFiles(projectId, files) {
    let results;
    this.fileForm.toggleSubmitButton(true);
    try {
      results = await this.s3Service.uploadObjects(projectId, files);
    } catch (error) {
      displayMessage(
        window.gettext(
          "An error has occured while generating the presigned URL. Please contact the support team."
        ),
        "error"
      );
      this.fileForm.toggleSubmitButton(false);
      throw error;
    }
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        displayMessage(
          window.interpolate(window.gettext("File %s has been uploaded."), [
            result.value.file.name,
          ]),
          "success"
        );
      } else {
        displayMessage(
          window.interpolate(window.gettext("File %s could not be uploaded."), [
            result.reason.file.name,
          ]),
          "error"
        );
      }
    });
    if (results.map((result) => result.status === "fulfilled").indexOf !== -1) {
      this.fileTable.toggleLoading(true);
      this.fetchFiles(projectId);
    }
    this.fileForm.toggleSubmitButton(false);
    this.fileForm.reset();
  }

  handleDeleteError(key) {
    displayMessage(
      window.interpolate(window.gettext("File %s could not be removed."), [
        key.split("/").pop(),
      ]),
      "error"
    );
    this.fileTable.toggleLoading(false);
  }

  handleDeleteSuccess(projectId, key) {
    this.fetchFiles(projectId);
    displayMessage(
      window.interpolate(window.gettext("File %s has been removed."), [
        key.split("/").pop(),
      ]),
      "success"
    );
  }
}
