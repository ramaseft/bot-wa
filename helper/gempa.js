const { default: axios } = require("axios");
const { default: Cheerio } = require("cheerio");

const getData = () =>
  new Promise((resolve, reject) => {
    axios
      .get("https://warning.bmkg.go.id")
      .then((result) => {
        const $ = Cheerio.load(result.data);
        resolve({
          image: $("div.infoext > p > a").attr("href"),
          data: $("p.alert-lindu").text(),
        });
      })
      .catch((err) => reject(err));
  });

module.exports = getData;
