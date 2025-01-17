/**
 * Inspired by Jun Tarnate snippet available on Code Pen at https://codepen.io/jeytii/pen/RyZpvo
 */
"use strict";
(function () {
  const getTags = (tagsInputNode) =>
    tagsInputNode.querySelectorAll(".tags-input__tag");

  const removeComma = (string) => string.split(",")[0].trim();

  const isInvalid = (tags, stringInput) => {
    const inputs = Array.from(tags).map(
      (input) => input.firstElementChild.textContent
    );

    return (
      !/^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}/.test(stringInput) ||
      inputs.some((name) => name === removeComma(stringInput))
    );
  };

  function setHiddenInputValue(inputElement) {
    inputElement.value = Array.from(getTags(inputElement.parentNode))
      .map((tag) => tag.querySelector("label").textContent)
      .join(",");
  }

  function modifyTags(event) {
    if (isInvalid(getTags(event.target.parentNode), event.target.value)) {
      event.target.value = "";
      return;
    }

    addTag(event.target.parentElement, event.target.value);
    setHiddenInputValue(
      event.target.parentNode.querySelector("input[type='hidden']")
    );
    event.target.value = "";
  }

  function addTag(tagsInputEl, textValue) {
    const tag = document.createElement("span"),
      tagName = document.createElement("label"),
      remove = document.createElement("span");

    tagName.setAttribute("class", "tags-input__tag-name");
    tagName.textContent = removeComma(textValue).toLowerCase();

    remove.setAttribute("class", "tags-input__remove");
    remove.textContent = "X";
    remove.addEventListener("click", (event) => {
      deleteTag(event.target.parentNode);
      event.stopImmediatePropagation();
    });

    tag.setAttribute("class", "tags-input__tag");
    tag.appendChild(tagName);
    tag.appendChild(remove);

    tagsInputEl.insertBefore(
      tag,
      tagsInputEl.querySelector('input[type="text"]')
    );
  }

  function deleteTag(tag) {
    const tags = getTags(tag.parentNode);
    const tagIndex = Array.from(tags).indexOf(tag);
    const tagsInputNode = tag.parentNode;
    tagsInputNode.removeChild(tags[tagIndex]);
    setHiddenInputValue(tagsInputNode.querySelector("input[type='hidden']"));
  }

  function focus(event) {
    (event.target.closest(".tags-input") || event.target)
      .querySelector('input[type="text"]')
      .focus();
  }

  function resizeInput(event) {
    event.target.size = event.target.value?.length || 1;
  }

  function checkTagDeletion(event) {
    if (
      event.key === "Backspace" &&
      !event.target.value.length &&
      getTags(event.target.parentNode).length > 0
    ) {
      const tags = getTags(event.target.parentNode);
      deleteTag(tags[tags.length - 1]);
    }
  }

  function onKeyUp(event) {
    if (event.key === ",") {
      modifyTags(event);
    }
  }

  function onBlur(event) {
    modifyTags(event);
  }

  function setup() {
    const tagInputs = document.querySelectorAll(".tags-input");

    for (let i = 0; i < tagInputs.length; i++) {
      const hiddenInput = tagInputs[i].querySelector('input[type="hidden"]');
      const initialValue = hiddenInput.value;
      if (initialValue) {
        const tags = initialValue.split(",");
        for (let i = 0; i < tags.length; i++) {
          addTag(hiddenInput.parentElement, tags[i]);
        }
      }

      document.querySelector(".tags-input").addEventListener("click", focus);
      document
        .querySelector(".tags-input input")
        .addEventListener("keydown", checkTagDeletion);
      document
        .querySelector(".tags-input input")
        .addEventListener("keyup", resizeInput);
      document
        .querySelector(".tags-input input")
        .addEventListener("keyup", onKeyUp);
      document
        .querySelector(".tags-input input")
        .addEventListener("blur", onBlur);
    }
  }

  document.addEventListener("DOMContentLoaded", setup);
})();
