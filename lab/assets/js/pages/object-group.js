(function () {
  function deleteRows(rowArray) {
    rowArray.forEach((el) => {
      el.querySelector("a.inline-deletelink").dispatchEvent(new Event("click"));
    });
  }

  function getObjectRows() {
    return document
      .getElementById("object_set-group")
      .querySelectorAll("tbody tr.dynamic-object_set");
  }

  function handleObjectGroupTypeChange(event) {
    /**
     * Toggle form interface between SINGLE OBJECT / OBJECT GROUP.
     * When selecting SINGLE OBJECT, group label input is disabled and
     * replaced by a hidden input ; all object rows are removed except the first
     * one, and the button to add a new one is hidden to prevent
     * adding multiple objects.
     */
    const { value } = event.target;
    const objectCountInput = document.getElementById("id_object_count");
    const objectsInline = document.getElementById("object_set-group");
    const objectsInlineFieldset = document.getElementById(
      "object_set-fieldset"
    );

    if (value === "SINGLE_OBJECT") {
      objectsInline.querySelector(".add-row").style.display = "none";

      objectCountInput.value = 1;
      updateObjectRows(0);

      objectsInlineFieldset.classList.add("hidden");
    } else if (value === "OBJECT_GROUP") {
      objectsInline.querySelector(".add-row").style.display = null;

      if (objectCountInput.value < 2) {
        objectCountInput.value = 2;
      }
      objectCountInput.setAttribute("min", 2);
      updateObjectRows(2);

      objectsInlineFieldset.classList.remove("hidden");
    }
  }

  function handleObjectCountChange(event) {
    if (document.getElementById("id_add_type").value === "SINGLE_OBJECT") {
      return;
    }
    updateObjectRows(event.target.value);
  }

  function updateObjectRows(newObjectCount) {
    const objectInlineEl = document.getElementById("object_set-group");
    const objectRows = getObjectRows();
    if (objectRows.length < newObjectCount) {
      for (let i = objectRows.length; i < newObjectCount; i++) {
        objectInlineEl.querySelector("tr.add-row a").click();
      }
    } else if (objectRows.length > newObjectCount) {
      const toDeleteRows = Array.from(objectRows).splice(
        newObjectCount - objectRows.length
      );
      deleteRows(toDeleteRows);
    }
  }

  function handleAccordionClick(event) {
    const isExpanded = !(event.target.getAttribute("aria-expanded") === "true"),
      objectCountField = document.querySelector(".field-object_count");
    if (isExpanded) {
      objectCountField.style.display = "none";
    } else {
      objectCountField.style.display = null;
      const objectRows = getObjectRows();
      deleteRows(Array.from(objectRows));
    }
  }

  function handleObjectRowUpdated() {
    // Called when adding or deleting an object row
    const objectRows = getObjectRows();
    document.getElementById("id_object_count").value = objectRows.length;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document
      .getElementById("id_add_type")
      .addEventListener("change", handleObjectGroupTypeChange);
    document
      .getElementById("id_object_count")
      .addEventListener("input", handleObjectCountChange);
    document
      .querySelector('button[aria-controls="differentiation-accordion"]')
      .addEventListener("click", handleAccordionClick);
    django.jQuery(document).on("formset:added", handleObjectRowUpdated);
    django.jQuery(document).on("formset:removed", handleObjectRowUpdated);
  });
})();
