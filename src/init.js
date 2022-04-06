import i18next from "i18next";
import onChange from "on-change";
import view from "./view.js";
import resources from "./locales/index.js";
import render from "./experiment.js";

export default () => {
  const elements = {
    feedback: document.querySelector(".feedback"),
    feeds: document.querySelector(".feeds"),
    form: document.querySelector(".rss-form"),
    input: document.getElementById("url-input"),
    posts: document.querySelector(".posts"),
    submitButton: document.querySelector('button[type="submit"]'),
  };
  const state = onChange(
    {
      lng: "ru",
      links: [],
      input: {
        readonly: false,
      },
      feedback: {
        error: null,
        success: null,
      },
      valid: true,
      newFeed: [],
      newPosts: [],
      feeds: [],
      posts: [],
    },
    render(elements)
  );

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: state.lng,
    resources,
  });

  view(elements, state, i18nextInstance);
};
