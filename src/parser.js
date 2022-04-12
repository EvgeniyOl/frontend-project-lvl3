// const parseXml = (content) => {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(content, "text/xml");
//   const errorElement = doc.querySelector("parsererror");
//   if (errorElement) {
//     const error = new Error("Invalid RSS structure");
//     error.process = "feedLoading";
//     error.type = "invalidFeedXml";
//     throw error;
//   }

//   const title = doc.querySelector("channel title").textContent;
//   const description = doc.querySelector("channel description").textContent;
//   const items = [...doc.querySelectorAll("item")].map((item) => ({
//     title: item.querySelector("title").textContent,
//     description: item.querySelector("description").textContent,
//     link: item.querySelector("link").textContent,
//   }));
//   return {
//     title,
//     description,
//     items,
//   };
// };
// export default parseXml;
