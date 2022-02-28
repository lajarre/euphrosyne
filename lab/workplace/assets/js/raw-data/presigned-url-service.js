"use strict";

import { getCSRFToken } from "../../../../assets/js/utils.js";

export class PresignedUrlService {
  fetchURL(url) {
    return fetch(url, {
      method: "POST",
      headers: new Headers({
        "X-CSRFToken": getCSRFToken(),
      }),
    });
  }

  async fetchDownloadPresignedURL(projectId, key) {
    const response = await this.fetchURL(
      `/api/project/${projectId}/workplace/raw_data/presigned_download_url?key=${key}`
    );
    return (await response.json()).url;
  }

  async fetchDeletePresignedURL(projectId, key) {
    const response = await this.fetchURL(
      `/api/project/${projectId}/workplace/raw_data/presigned_delete_url?key=${key}`
    );
    return (await response.json()).url;
  }

  async fetchListPresignedUrl(projectId) {
    const response = await this.fetchURL(
      `/api/project/${projectId}/workplace/raw_data/presigned_list_url`
    );
    return (await response.json()).url;
  }

  async fetchUploadPresignedUrl(projectId) {
    const response = await this.fetchURL(
      `/api/project/${projectId}/workplace/raw_data/presigned_post`
    );
    return (await response.json()).url;
  }
}
