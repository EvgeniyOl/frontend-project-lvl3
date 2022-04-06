const renderIdleStatus = (elements) => {
  elements.formInput.removeAttribute("readonly");
  elements.formInput.focus();
  elements.formButton.disabled = false;
  elements.spinner.classList.add("d-none");
};

const renderProcessingStatus = (elements) => {
  elements.feedback.textContent = "";
  elements.formButton.disabled = true;
  elements.formInput.setAttribute("readonly", "true");
  elements.spinner.classList.remove("d-none");
};

const renderErrorStatus = (elements, errorMessage) => {
  elements.feedback.classList.remove("text-success");
  elements.feedback.classList.add("text-danger");
  elements.feedback.textContent = errorMessage;
  elements.formInput.removeAttribute("readonly");
  elements.formButton.disabled = false;
  elements.spinner.classList.add("d-none");
};

const renderSuccessStatus = (elements, successMessage) => {
  renderIdleStatus(elements);
  elements.feedback.classList.remove("text-danger");
  elements.feedback.classList.add("text-success");
  elements.feedback.textContent = successMessage;
  elements.formInput.value = "";
};

const renderFormValidationProcess = (i18, formValidationState, elements) => {
  const textElements = document.querySelectorAll("[data-text]");
  textElements.forEach((element) => {
    element.textContent = i18.t(element.dataset.text);
  });

  switch (formValidationState.status) {
    case "idle": {
      renderIdleStatus(elements);
      elements.formInput.classList.remove("is-invalid");
      break;
    }
    case "validation": {
      renderProcessingStatus(elements);
      break;
    }
    case "error": {
      elements.formInput.classList.add("is-invalid");
      renderErrorStatus(elements, i18.t(`errors.${formValidationState.error}`));
      break;
    }
    default:
      throw new Error(
        `Untracked formValidation status: ${formValidationState.status}`
      );
  }
};

const renderFeedLoadingProcess = (i18, feedLoadingState, elements) => {
  switch (feedLoadingState.status) {
    case "idle": {
      renderIdleStatus(elements);
      break;
    }
    case "loading": {
      renderProcessingStatus(elements);
      break;
    }
    case "error": {
      renderErrorStatus(elements, i18.t(`errors.${feedLoadingState.error}`));
      break;
    }
    case "success": {
      renderSuccessStatus(elements, i18.t("success"));
      break;
    }
    default:
      throw new Error(
        `Untracked feedLoading status: ${feedLoadingState.status}`
      );
  }
};

const createTitle = (field, title) => {
  if (field.querySelector(".card")) {
    return;
  }
  const div = document.createElement("div");
  field.appendChild(div);
  div.classList.add("card", "border-0");
  const ul = document.createElement("ul");
  const card = document.createElement("div");
  div.appendChild(card);
  card.classList.add("card-body");
  div.appendChild(ul);
  ul.classList.add("list-group", "border-0", "rounded-0");
  const h2 = document.createElement("h2");
  card.appendChild(h2);
  h2.classList.add("card-title", "h4");
  h2.textContent = title;
};

const closeModal = (modal, body, div) => {
  body.classList.remove("modal-open");
  modal.classList.remove("show");
  modal.setAttribute("style", "display: none;");
  body.setAttribute("style", "");
  div.remove();
};

const changeLink = (link) => {
  link.classList.remove("fw-bold");
  link.classList.add("fw-normal", "link-secondary");
};

const renderModal = (postTitle, postDescription, postLink, link) => {
  const modal = document.getElementById("modal");
  const body = document.querySelector("body");
  body.classList.add("modal-open");
  body.setAttribute("style", "overflow: hidden; padding-right: 17px;");
  const modalHeader = document.querySelector(".modal-header");
  const modalBody = document.querySelector(".modal-body");
  const modalFooter = document.querySelector(".modal-footer");
  modal.classList.add("show");
  modal.setAttribute("style", "display: block;");
  modal.setAttribute("role", "dialog");
  modalHeader.querySelector(".modal-title").textContent = postTitle;
  modalBody.textContent = postDescription;
  modalFooter.querySelector("a").setAttribute("href", postLink);
  const div = document.createElement("div");
  body.appendChild(div);
  div.classList.add("modal-backdrop", "fade", "show");

  modalHeader.querySelector("button").addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(modal, body, div);
    changeLink(link);
  });

  modalFooter.querySelector("button").addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(modal, body, div);
    changeLink(link);
  });
};

const renderPosts = (elements, posts) => {
  const fieldPost = elements.posts;
  const ul = fieldPost.querySelector(".list-group");
  posts.forEach((post) => {
    const { postTitle, postDescription, postLink, postId } = post;
    const li = document.createElement("li");
    const link = document.createElement("a");
    const button = document.createElement("button");
    ul.prepend(li);
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-start",
      "border-0",
      "border-end-0"
    );
    li.prepend(link);
    link.setAttribute("href", postLink);
    link.classList.add("fw-bold");
    link.setAttribute("data-id", postId);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.textContent = postTitle;
    li.appendChild(button);
    button.setAttribute("type", "button");
    button.classList.add("btn", "btn-outline-primary", "btn-sm");
    button.setAttribute("data-id", postId);
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("data-bs-target", "#modal");
    button.textContent = "Просмотр";

    button.addEventListener("click", (e) => {
      e.preventDefault();
      renderModal(postTitle, postDescription, postLink, link);
      changeLink(link);
    });

    link.addEventListener("click", () => {
      changeLink(link);
    });
  });
};

const renderFeeds = (elements, feeds) => {
  const fieldFeed = elements.feeds;
  createTitle(fieldFeed, "Фиды");
  createTitle(elements.posts, "Посты");
  const ul = fieldFeed.querySelector(".list-group");
  feeds.forEach((feed) => {
    const { feedDescription, feedTitle } = feed;
    const li = document.createElement("li");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    ul.prepend(li);
    li.classList.add("list-group-item", "border-0", "border-end-0");
    li.appendChild(h3);
    h3.classList.add("h6", "m-0");
    h3.textContent = feedTitle;
    li.appendChild(p);
    p.classList.add("m-0", "small", "text-black-50");
    p.textContent = feedDescription;
  });
};

const blockInput = (elements, value) => {
  if (value === true) {
    elements.input.setAttribute("readonly", value);
    elements.submitButton.setAttribute("disabled", "");
  } else {
    elements.input.removeAttribute("readonly");
    elements.submitButton.removeAttribute("disabled");
  }
};

const render = (elements) => (path, errorMessage) => {
  if (path === "feedback.error") {
    renderFormValidationProcess(elements, errorMessage);
  }
  if (path === "feedback.success") {
    renderFormValidationProcess(elements, errorMessage);
  }
  if (path === "newFeed") {
    renderFeeds(elements, errorMessage);
  }
  if (path === "newPosts") {
    renderPosts(elements, errorMessage.reverse());
  }
  if (path === "input.readonly") {
    blockInput(elements, errorMessage);
  }
};

export default render;
