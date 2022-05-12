import 'bootstrap';
import i18next from 'i18next';
import resources from './locales/index.js';
import initRender from './render.js';
import * as service from './controller.js';

const app = () => {
  const defaultLanguage = 'ru';
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
      seenPosts: new Set(),
    },
  };
  const i18 = i18next.createInstance();
  const options = { lng: defaultLanguage, resources };
  const initApp = () => initRender(state, i18, service);
  return i18.init(options).then(initApp);
};

export default app;
