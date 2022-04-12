const getItem = (element) => ({
  postTitle: element.querySelector("title")?.textContent,
  postDescription: element.querySelector("description")?.textContent,
  postLink: element.querySelector("link")?.textContent,
  postId: element.querySelector("guid")?.textContent,
});

export default (data, feedback, i18n) => {
  const domParser = new DOMParser();
  const xmlDocument = domParser.parseFromString(data, "application/xml");
  if (xmlDocument.querySelector("parsererror")) {
    feedback.error = i18n.t("errors.parse");
  }
  return {
    // feedTitle: xmlDocument.querySelector("title")?.textContent,
    // feedDescription: xmlDocument.querySelector("description")?.textContent,
    feedItems: [...xmlDocument.querySelectorAll("item")].map(getItem),
  };
};
