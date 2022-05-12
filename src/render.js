import onChange from 'on-change';

const renderIdleStatus = (uiElements) => {
  uiElements.formInput.removeAttribute('readonly');
  uiElements.formInput.focus();
  uiElements.formButton.disabled = false;
  uiElements.spinner.classList.add('d-none');
};

const renderProcessingStatus = (uiElements) => {
  uiElements.feedback.textContent = '';
  uiElements.formButton.disabled = true;
  uiElements.formInput.setAttribute('readonly', 'true');
  uiElements.spinner.classList.remove('d-none');
};

const renderErrorStatus = (uiElements, errorMessage) => {
  uiElements.feedback.classList.remove('text-success');
  uiElements.feedback.classList.add('text-danger');
  uiElements.feedback.textContent = errorMessage;
  uiElements.formInput.removeAttribute('readonly');
  uiElements.formButton.disabled = false;
  uiElements.spinner.classList.add('d-none');
};

const renderSuccessStatus = (uiElements, successMessage) => {
  renderIdleStatus(uiElements);
  uiElements.feedback.classList.remove('text-danger');
  uiElements.feedback.classList.add('text-success');
  uiElements.feedback.textContent = successMessage;
  uiElements.formInput.value = '';
};

const renderFormValidationProcess = (i18, formValidationState, uiElements) => {
  const textElements = document.querySelectorAll('[data-text]');
  textElements.forEach((element) => {
    element.textContent = i18.t(element.dataset.text);
  });

  switch (formValidationState.status) {
    case 'idle': {
      renderIdleStatus(uiElements);
      uiElements.formInput.classList.remove('is-invalid');
      break;
    }
    case 'validation': {
      renderProcessingStatus(uiElements);
      break;
    }
    case 'error': {
      uiElements.formInput.classList.add('is-invalid');
      renderErrorStatus(uiElements, i18.t(`errors.${formValidationState.error}`));
      break;
    }
    default:
      throw new Error(`Untracked formValidation status: ${formValidationState.status}`);
  }
};

const renderFeedLoadingProcess = (i18, feedLoadingState, uiElements) => {
  switch (feedLoadingState.status) {
    case 'idle': {
      renderIdleStatus(uiElements);
      break;
    }
    case 'loading': {
      renderProcessingStatus(uiElements);
      break;
    }
    case 'error': {
      renderErrorStatus(uiElements, i18.t(`errors.${feedLoadingState.error}`));
      break;
    }
    case 'success': {
      renderSuccessStatus(uiElements, i18.t('success'));
      break;
    }
    default:
      throw new Error(`Untracked feedLoading status: ${feedLoadingState.status}`);
  }
};

const renderFeeds = (i18, state, uiElements) => {
  const card = document.createElement('div');
  card.classList.add('card');

  const h4 = document.createElement('h4');
  h4.classList.add('card-header');
  h4.dataset.text = 'feedsColumn';
  h4.textContent = i18.t('feedsColumn');

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'list-group-flush');
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'py-2');

    const h6 = document.createElement('h6');
    h6.classList.add('m-0');
    h6.textContent = feed.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-secondary');
    p.textContent = feed.description;

    li.append(h6, p);
    feedsList.append(li);
  });

  card.append(h4, feedsList);
  uiElements.feedsContainer.replaceChildren(card);
};

const renderPosts = (i18, state, uiElements) => {
  const card = document.createElement('div');
  card.classList.add('card');

  const h4 = document.createElement('h4');
  h4.classList.add('card-header');
  h4.dataset.text = 'postsColumn';
  h4.textContent = i18.t('postsColumn');

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'list-group-flush');
  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'py-2');

    const a = document.createElement('a');
    a.classList.add('m-0');
    if (state.ui.seenPosts.has(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.href = post.link;
    a.target = '_blank';
    a.textContent = post.title;
    a.dataset.postId = post.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18.t('viewPostButton');
    button.dataset.text = 'viewPostButton';
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.dataset.postId = post.id;

    li.append(a, button);
    postsList.append(li);
  });

  card.append(h4, postsList);
  uiElements.postsContainer.replaceChildren(card);
};

const renderModal = (i18, state, uiElements) => {
  const post = state.posts.find((element) => element.id === state.modal.postId);

  uiElements.modalTitle.textContent = post.title;
  const p = document.createElement('p');
  p.textContent = post.description;
  uiElements.modalBody.replaceChildren(p);
  uiElements.modalRead.textContent = i18.t('modal.read');
  uiElements.modalRead.href = post.link;
  uiElements.modalClose.textContent = i18.t('modal.close');
};

const render = (state, i18, uiElements) => (path, value) => {
  if (path === 'formValidation.status') renderFormValidationProcess(i18, state.formValidation, uiElements);
  if (path === 'feedLoading.status') renderFeedLoadingProcess(i18, state.feedLoading, uiElements);
  if (path === 'feeds') renderFeeds(i18, state, uiElements);
  if (path === 'posts') renderPosts(i18, state, uiElements);
  if (path === 'ui.seenPosts') renderPosts(i18, state, uiElements);
  if (path === 'modal.postId') renderModal(i18, state, uiElements);
  if (path === 'language') i18.changeLanguage(value).then(() => { renderFormValidationProcess(i18, state.formValidation, uiElements); });
};

export default (state, i18, service) => {
  const {
    loadFeed, handleReadPost, changeLanguage, clearPost, updateFeeds,
  } = service;

  const uiElements = {
    body: document.querySelector('body'),
    form: document.querySelector('form'),
    formInput: document.querySelector('form #feed-url'),
    formButton: document.querySelector('form button'),
    feedback: document.querySelector('#feedback'),
    spinner: document.querySelector('#spinner'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
    languageSelector: document.querySelector('#language-selector'),
    modal: document.querySelector('#modal'),
    modalTitle: document.querySelector('#modal-title'),
    modalBody: document.querySelector('#modal-body'),
    modalRead: document.querySelector('#modal-read'),
    modalClose: document.querySelector('#modal-close'),
  };

  const watchedState = onChange(state, render(state, i18, uiElements));

  uiElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(uiElements.form);
    const feedUrl = formData.get('feed-url').trim();
    loadFeed(watchedState, feedUrl);
  });
  uiElements.postsContainer.addEventListener('click', (e) => {
    const { postId } = e.target.dataset;
    handleReadPost(watchedState, postId);
  });
  uiElements.languageSelector.addEventListener('click', (e) => {
    const { language } = e.target.dataset;
    changeLanguage(watchedState, language);
  });

  uiElements.modal.addEventListener('hidden.bs.modal', () => {
    clearPost(watchedState);
  });

  renderFormValidationProcess(i18, state.formValidation, uiElements);
  updateFeeds(watchedState);

  return watchedState;
};
