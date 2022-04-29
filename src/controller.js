import axios from 'axios';
import { setLocale, string } from 'yup';
import uniqueId from 'lodash/uniqueId.js';

const POST_ID_PREFIX = 'post_';
const FEED_ID_PREFIX = 'feed_';
const UPDATE_INTERVAL = 5000;

const validateUrl = (rawUrl, feeds) => {
  setLocale({
    mixed: {
      notOneOf: 'duplicateFeedUrl',
      required: 'emptyUrl',
    },
    string: {
      url: 'invalidFeedUrl',
    },
  });
  const feedUrls = feeds.map((feed) => feed.url);
  const schema = string().required().url().notOneOf(feedUrls);
  return schema.validate(rawUrl)
    .catch((error) => {
      error.process = 'formValidation';
      error.type = error.message;
      throw error;
    });
};

const generateProxiedUrl = (url) => {
  const proxyUrl = 'https://allorigins.hexlet.app/get';
  const proxiedUrl = new URL(proxyUrl);
  proxiedUrl.searchParams.set('disableCache', 'true');
  proxiedUrl.searchParams.set('url', url);
  return proxiedUrl;
};

const downloadXml = (url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return axios.get(proxiedUrl.href)
    .then((response) => response.data.contents)
    .catch((error) => {
      error.process = 'feedLoading';
      error.type = 'networkError';
      throw error;
    });
};

const parseXml = (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');
  const errorElement = doc.querySelector('parsererror');
  if (errorElement) {
    const error = new Error('Invalid RSS structure');
    error.process = 'feedLoading';
    error.type = 'invalidFeedXml';
    throw error;
  }

  const title = doc.querySelector('channel title').textContent;
  const description = doc.querySelector('channel description').textContent;
  const items = [...doc.querySelectorAll('item')]
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));
  return {
    title,
    description,
    items,
  };
};

const saveFeed = (watchedState, feedUrl, feedData) => {
  const feedId = uniqueId(FEED_ID_PREFIX);
  const feed = {
    id: feedId,
    url: feedUrl,
    title: feedData.title,
    description: feedData.description,
  };
  const posts = feedData.items.map((post) => ({
    id: uniqueId(POST_ID_PREFIX),
    feedId,
    ...post,
  }));
  watchedState.feeds.push(feed);
  watchedState.posts.push(...posts);
};

const loadFeed = (watchedState, feedUrl) => {
  watchedState.formValidation.status = 'validation';
  validateUrl(feedUrl, watchedState.feeds)
    .then(() => {
      watchedState.formValidation.isValid = true;
      watchedState.formValidation.error = null;
      watchedState.formValidation.status = 'idle';
      watchedState.feedLoading.status = 'loading';
    })
    .then(() => downloadXml(feedUrl))
    .then((content) => parseXml(content))
    .then((feedData) => saveFeed(watchedState, feedUrl, feedData))
    .then(() => {
      watchedState.feedLoading.error = null;
      watchedState.feedLoading.status = 'success';
    })
    .catch((error) => {
      switch (error.process) {
        case 'formValidation': {
          watchedState.formValidation.isValid = false;
          watchedState.formValidation.error = error.type;
          watchedState.formValidation.status = 'error';
          break;
        }
        case 'feedLoading': {
          watchedState.feedLoading.error = error.type;
          watchedState.feedLoading.status = 'error';
          break;
        }
        default:
          throw new Error(`Error handling untracked process: ${error.process}`);
      }
    });
};

const updateSavedFeed = (watchedState, savedFeed, newFeedData) => {
  const savedFeedPostLinks = watchedState.posts
    .filter((post) => post.feedId === savedFeed.id)
    .map((post) => post.link);
  const newPosts = newFeedData.items
    .filter((post) => !savedFeedPostLinks.includes(post.link))
    .map((post) => ({
      id: uniqueId(POST_ID_PREFIX),
      feedId: savedFeed.id,
      ...post,
    }));
  if (newPosts.length !== 0) {
    watchedState.posts.push(...newPosts);
  }
};

const updateFeed = (watchedState, feed) => (
  downloadXml(feed.url)
    .then((content) => parseXml(content))
    .then((feedData) => updateSavedFeed(watchedState, feed, feedData))
    .catch((error) => {
      watchedState.feedLoading.error = error.type;
      watchedState.feedLoading.status = 'error';
    })
);

const updateFeeds = (watchedState) => {
  Promise.all(watchedState.feeds.map((feed) => updateFeed(watchedState, feed)))
    .then(() => {
      watchedState.feedLoading.error = null;
      watchedState.feedLoading.status = 'idle';
    })
    .finally(() => {
      setTimeout(updateFeeds, UPDATE_INTERVAL, watchedState);
    });
};

const changeLanguage = (watchedState, language) => {
  watchedState.formValidation.status = 'idle';
  watchedState.language = language;
};

const handleReadPost = (watchedState, postElement) => {
  const { postId } = postElement.dataset;
  watchedState.ui.seenPosts.has(postId);

  if (postElement.tagName === 'BUTTON') {
    watchedState.modal.postId = postId;
    watchedState.modal.isVisible = true;
  }
};

const closeModal = (watchedState) => {
  watchedState.modal.postId = null;
  watchedState.modal.isVisible = false;
};

export {
  changeLanguage,
  closeModal,
  handleReadPost,
  loadFeed,
  updateFeeds,
};
