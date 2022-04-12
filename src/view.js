import _ from "lodash";
import parseXml from "./parser.js";
import axios from "axios";
import { setLocale, string } from "yup";

const POST_ID_PREFIX = "post_";
const FEED_ID_PREFIX = "feed_";
const UPDATE_INTERVAL = 5000;

const validateUrl = (rawUrl, feeds) => {
  setLocale({
    mixed: {
      notOneOf: "duplicateFeedUrl",
      required: "emptyUrl",
    },
    string: {
      url: "invalidFeedUrl",
    },
  });
  const feedUrls = feeds.map((feed) => feed.url);
  const schema = string().required().url().notOneOf(feedUrls);
  return schema.validate(rawUrl).catch((error) => {
    error.process = "formValidation";
    error.type = error.message;
    throw error;
  });
};

const generateProxiedUrl = (url) => {
  const proxyUrl = "https://allorigins.hexlet.app/get";
  const proxiedUrl = new URL(proxyUrl);
  proxiedUrl.searchParams.set("disableCache", "true");
  proxiedUrl.searchParams.set("url", url);
  return proxiedUrl;
};

const downloadXml = (url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return axios
    .get(proxiedUrl.href)
    .then((response) => response.data.contents)
    .catch((error) => {
      error.process = "feedLoading";
      error.type = "networkError";
      throw error;
    });
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

// const getNewPost = async (state, i18n) => {
//   state.links.forEach(async (link) => {
//     const response = await makeRequest(state, i18n, link);
//     const newFeed = parser(response.contents, state.feedback, i18n);
//     const newPosts = _.differenceBy(newFeed.feedItems, state.posts, "postLink");
//     if (newPosts.length > 0) {
//       state.newPosts = [...newPosts];
//       state.posts = [...state.newPosts, ...state.posts];
//     }
//   });
//   setTimeout(() => getNewPost(state, i18n), 5000);
// };

// const getFeeds = async (state, i18n, link) => {
//   const response = await makeRequest(state, i18n, link);
//   const newFeed = parser(response.contents, state.feedback, i18n);
//   state.newFeed = [newFeed];
//   state.feeds = [...state.newFeed, ...state.feeds];
// };

// const runValidation = async (state, i18n, link) => {
//   state.feedback.error = await validate(link, state.links, i18n);
//   if (state.feedback.error !== null) {
//     state.feedback.success = null;
//     return;
//   }
//   state.input.readonly = true;
//   await getFeeds(state, i18n, link);
//   state.links.push(link);
//   await getNewPost(state, i18n);
//   if (state.feedback.error === null) {
//     state.feedback.success = null;
//     state.feedback.success = i18n.t("success");
//   }
//   state.input.readonly = false;
// };

// const view = (elements, state, i18n) => {
//   elements.form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     await runValidation(state, i18n, elements.input.value);
//   });
// };

export default view;
