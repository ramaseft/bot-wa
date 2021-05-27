const axios = require("axios");
const FormData = require("form-data");
const getShortLink = require("./shortlink");

const getDataDownload = (url, type) =>
  new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("link", url);
    data.append("downloader", type);

    const config = {
      method: "post",
      url: "https://igdownloader.com/ajax",
      headers: {
        Referer: "https://igdownloader.com/video-downloader",
        Origin: "https://igdownloader.com",
        "x-requested-with": "XMLHttpRequest",
        ...data.getHeaders(),
      },
      data: data,
    };

    axios(config)
      .then(async function (response) {
        if (!response.data.error) {
          resolve(
            await getShortLink(
              response.data.html.split('rel="noopener noreferrer" href="')[1].split('"')[0]
            )
          );
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });

module.exports = getDataDownload;
