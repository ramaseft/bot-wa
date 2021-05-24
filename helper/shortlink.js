const { default: axios } = require("axios");

const getShortLink = (longLink) =>
  new Promise((resolve, reject) => {
    axios
      .get(`https://tinyurl.com/api-create.php?url=${longLink}`)
      .then((result) => {
        resolve(result.data);
      })
      .catch(() => reject("Internal Server Error"));
  });

module.exports = getShortLink;
