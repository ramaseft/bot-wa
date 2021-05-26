const { default: axios } = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const getShortLink = require("./shortlink");

const parseLink = (urlShare) =>
  new Promise((resolve, reject) => {
    axios
      .get(urlShare)
      .then((result) => {
        resolve(
          result.data
            .split('<link data-react-helmet="true" rel="canonical" href="')[1]
            .split('"')[0]
        );
      })
      .catch(() => {
        reject("Internal Server Error");
      });
  });

const getCookie = (url) =>
  new Promise((resolve, reject) => {
    axios.get(`https://ttdownloader.com/?url=${url}`).then((result) => {
      resolve(`${result.headers["set-cookie"][0].split(" ")[0]} popCookie=1`);
    });
  });

const getDownloadLink = (url) =>
  new Promise(async (resolve, reject) => {
    const data = new FormData();
    const link = url.match("https://vt.tiktok.com/") ? await parseLink(url) : url;
    const cookie = await getCookie(link);
    data.append("url", link);
    axios
      .post(`https://ttdownloader.com/?url=${link}`, data, {
        headers: {
          Cookie: cookie,
          ...data.getHeaders(),
        },
      })
      .then((result) => {
        const $ = cheerio.load(result.data);
        const token = $("#token").attr("value");
        const data2 = new FormData();
        data2.append("url", link);
        data2.append("token", token);
        axios
          .post("https://ttdownloader.com/ajax/", data2, {
            headers: {
              Cookie: cookie.split(" ")[0],
              ...data2.getHeaders(),
            },
          })
          .then(async (resultLink) => {
            const $ = cheerio.load(resultLink.data);
            resolve({
              status: true,
              message: "",
              link: await getShortLink($(".download-link").attr("href")),
            });
          });
      })
      .catch(() => {
        reject({
          status: false,
          message: "Internal Server Error",
          link: "",
        });
      });
  });

module.exports = getDownloadLink;
