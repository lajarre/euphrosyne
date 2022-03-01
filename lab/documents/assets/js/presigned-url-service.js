"use strict";

import { getCSRFToken } from "../../../assets/js/utils.js";

export class DocumentPresignedUrlService {
  constructor(projectId) {
    this.projectId = projectId;
  }

  fetchURL(url) {
    return fetch(url, {
      method: "POST",
      headers: new Headers({
        "X-CSRFToken": getCSRFToken(),
      }),
    });
  }

  async fetchDownloadPresignedURL(key) {
    const response = await this.fetchURL(
      `/api/project/${this.projectId}/documents/presigned_download_url?key=${key}`
    );
    return (await response.json()).url;
  }

  async fetchDeletePresignedURL(key) {
    const response = await this.fetchURL(
      `/api/project/${this.projectId}/documents/presigned_delete_url?key=${key}`
    );
    return (await response.json()).url;
  }

  async fetchListPresignedUrl() {
    const response = await this.fetchURL(
      `/api/project/${this.projectId}/documents/presigned_list_url`
    );
    return (await response.json()).url;
  }

  async fetchUploadPresignedUrl() {
    const response = await this.fetchURL(
      `/api/project/${this.projectId}/documents/presigned_post`
    );
    return (await response.json()).url;
  }
}
