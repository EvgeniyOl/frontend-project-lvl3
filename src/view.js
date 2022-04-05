import _ from "lodash";
import axios from "axios";
import validate from "./validation.js";
import parser from "./parser.js";

const makeRequest = async (state, i18n, link) => {
  try {
    const response = await axios.get(
      `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
        link
      )}`
    );
    return response.data;
  } catch (e) {
    state.feedback.error = i18n.t("errors.netError");
    return i18n.t("errors.netError");
  }
};

const getNewPost = async (state, i18n) => {
  state.links.forEach(async (link) => {
    const response = await makeRequest(state, i18n, link);
    const newFeed = parser(response.contents, state.feedback, i18n);
    const newPosts = _.differenceBy(newFeed.feedItems, state.posts, "postLink");
    if (newPosts.length > 0) {
      state.newPosts = [...newPosts];
      state.posts = [...state.newPosts, ...state.posts];
    }
  });
  setTimeout(() => getNewPost(state, i18n), 5000);
};

const getFeeds = async (state, i18n, link) => {
  const response = await makeRequest(state, i18n, link);
  const newFeed = parser(response.contents, state.feedback, i18n);
  state.newFeed = [newFeed];
  state.feeds = [...state.newFeed, ...state.feeds];
};

const runValidation = async (state, i18n, link) => {
  state.feedback.error = await validate(link, state.links, i18n);
  if (state.feedback.error !== null) {
    state.feedback.success = null;
    return;
  }
  state.input.readonly = true;
  // await getFeeds(state, i18n, link);
  // state.links.push(link);
  // await getNewPost(state, i18n);
  // if (state.feedback.error === null) {
  //   // state.feedback.success = null;
  //   state.feedback.success = i18n.t("success");
  // }
  // state.input.readonly = false;
};

const view = (elements, state, i18n) => {
  elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await runValidation(state, i18n, elements.input.value);
  });
};

export default view;
