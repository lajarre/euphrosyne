import {
  handleAccordionClick,
  updateObjectRows,
  displaySingleObjectForm,
  displayObjectGroupForm,
  toggleInlineInputsDisabledOnParentChange,
} from "../object/form.js";

document.addEventListener("DOMContentLoaded", function () {
  const getObjectsInlineEl = () => document.getElementById("object_set-group"),
    getObjectRows = () =>
      getObjectsInlineEl().querySelectorAll("tbody tr.dynamic-object_set"),
    getObjectCountInput = () => document.getElementById("id_object_count"),
    getAddTypeInput = () => document.getElementById("id_add_type"),
    getAccordionButton = () =>
      document.querySelector(
        'button[aria-controls="differentiation-accordion"]'
      );

  function onFormsetChange() {
    const isExpanded = !(
      getAccordionButton().getAttribute("aria-expanded") === "true"
    );
    if (isExpanded) {
      getObjectCountInput().value = getObjectRows().length;
    }
  }

  document
    .getElementById("id_add_type")
    .addEventListener("change", function (event) {
      const { value } = event.target;
      if (value === "SINGLE_OBJECT") {
        displaySingleObjectForm();
      } else if (value === "OBJECT_GROUP") {
        displayObjectGroupForm();
      }
    });

  document
    .getElementById("id_object_count")
    .addEventListener("input", function (event) {
      if (getAddTypeInput().value === "SINGLE_OBJECT") {
        return;
      }
      updateObjectRows(event.target.value);
    });

  document
    .querySelector('button[aria-controls="differentiation-accordion"]')
    .addEventListener("click", function (event) {
      const isExpanded = !(
        event.target.getAttribute("aria-expanded") === "true"
      );
      handleAccordionClick(isExpanded, getObjectCountInput().value);
    });

  document
    .getElementById("id_inventory")
    .addEventListener("change", (event) => {
      toggleInlineInputsDisabledOnParentChange("inventory", event.target.value);
    });
  document
    .getElementById("id_collection")
    .addEventListener("change", (event) => {
      toggleInlineInputsDisabledOnParentChange(
        "collection",
        event.target.value
      );
    });

  django.jQuery(document).on("formset:added", onFormsetChange);
  django.jQuery(document).on("formset:removed", onFormsetChange);
});
