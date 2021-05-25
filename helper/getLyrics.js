const search = require("@youka/lyrics");

const getLyrics = (query) =>
  new Promise((resolve, reject) => {
    search(query)
      .then((result) => resolve(result))
      .catch(() => reject("Lyrics Not Found"));
  });

module.exports = getLyrics;
