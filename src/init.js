import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import {
  changeLanguage,
  handleReadPost,
  loadFeed,
  updateFeeds,
} from './controller.js';

import {
  renderModal,
  renderFeedLoadingProcess,
  renderFeeds,
  renderFormValidationProcess,
  renderPosts,
} from './render.js';

export default () => {
  const defaultLanguage = 'ru';

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

  const i18 = i18next.createInstance();
  return i18
    .init({
      lng: defaultLanguage,
      resources,
    })
    .then(() => {
      const state = {
        language: defaultLanguage,
        formValidation: {
          status: 'idle',
          isValid: true,
          error: null,
        },
        feedLoading: {
          status: 'idle',
          error: null,
        },
        feeds: [],
        posts: [],
        modal: {
          postId: null,
        },
        ui: {
          isVisible: false,
          seenPosts: [],
        },
      };
      const watchedState = onChange(state, (path, value) => {
        switch (path) {
          case 'language': {
            i18.changeLanguage(value).then(() => {
              renderFormValidationProcess(
                i18,
                state.formValidation,
                uiElements,
              );
            });
            break;
          }
          case 'formValidation.status': {
            renderFormValidationProcess(i18, state.formValidation, uiElements);
            break;
          }
          case 'feedLoading.status': {
            renderFeedLoadingProcess(i18, state.feedLoading, uiElements);
            break;
          }
          case 'feeds': {
            renderFeeds(i18, state, uiElements);
            break;
          }
          case 'posts':
          case 'ui.seenPosts': {
            renderPosts(i18, state, uiElements);
            break;
          }
          case 'modal.isVisible': {
            renderModal(i18, state, uiElements);
            break;
          }
          default: throw new Error('Unknown state!');
        }
      });

      uiElements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(uiElements.form);
        const feedUrl = formData.get('feed-url').trim();
        loadFeed(watchedState, feedUrl);
      });

      uiElements.postsContainer.addEventListener('click', (e) => {
        const postElement = e.target;
        handleReadPost(watchedState, postElement);
      });

      uiElements.languageSelector.addEventListener('click', (e) => {
        const { language } = e.target.dataset;
        changeLanguage(watchedState, language);
      });

      renderFormValidationProcess(i18, state.formValidation, uiElements);

      updateFeeds(watchedState);
    });
};
