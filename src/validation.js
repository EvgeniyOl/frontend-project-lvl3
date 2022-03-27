import * as yup from "yup";

const validate = async (link, links, i18n) => {
  const schema = yup
    .string()
    .url(i18n.t("errors.link"))
    .notOneOf(links, i18n.t("errors.uniq"))
    .required();
  try {
    await schema.validate(link);
    return null;
  } catch (e) {
    return e.message;
  }
};

export default validate;
