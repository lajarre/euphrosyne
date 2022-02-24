"use strict";

import { displayMessage } from "../../../assets/js/utils.js";
import { fetchDownloadPresignedURL } from "./presigned-url-service.js";
import { listObjectsV2, deleteObject } from "./s3-service.js";

function getDocumentTable() {
  return document.getElementById("document_list");
}

export async function fetchDocuments(projectId) {
  const keys = await listObjectsV2(projectId);
  getDocumentTable().updateFiles(projectId, keys);
}

export async function downloadDocument(projectId, key) {
  const url = await fetchDownloadPresignedURL(projectId, key);
  window.open(url, "_blank");
}

export async function deleteDocument(projectId, key) {
  if (
    !window.confirm(
      window.interpolate(window.gettext("Delete the document %s ?"), [
        key.split("/").pop(),
      ])
    )
  ) {
    return;
  }
  getDocumentTable().toggleLoading(true);
  try {
    await deleteObject(projectId, key);
    handleDeleteSuccess(projectId, key);
  } catch (error) {
    handleDeleteError(key);
    throw error;
  }
}
function handleDeleteError(key) {
  displayMessage(
    window.interpolate(window.gettext("File %s could not be removed."), [
      key.split("/").pop(),
    ]),
    "error"
  );
  getDocumentTable().toggleLoading(false);
}

function handleDeleteSuccess(projectId, key) {
  fetchDocuments(projectId);
  displayMessage(
    window.interpolate(window.gettext("File %s has been removed."), [
      key.split("/").pop(),
    ]),
    "success"
  );
}
