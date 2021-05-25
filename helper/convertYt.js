const { default: axios } = require("axios");
const FormData = require("form-data");
const getShortLink = require("./shortlink");

const getDataRequest = (url, type) =>
  new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("q", url);
    data.append("vt", type);
    axios
      .post(`https://yt1s.com/api/ajaxSearch/index`, data, {
        headers: {
          ...data.getHeaders(),
        },
      })
      .then((result) => {
        resolve(result.data);
      })
      .catch(() => reject("Internal Server Error"));
  });

const getDataDownload = (vid, k) =>
  new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("vid", vid);
    data.append("k", k);
    axios
      .post(`https://yt1s.com/api/ajaxConvert/convert`, data, {
        headers: {
          ...data.getHeaders(),
        },
      })
      .then((result) => {
        resolve(result.data);
      })
      .catch(() => reject("Internal Server Error"));
  });

const convertYt = (url, type) =>
  new Promise((resolve, reject) => {
    getDataRequest(url, type)
      .then((resultData) => {
        if (!resultData.mess) {
          getDataDownload(resultData.vid, resultData.kc)
            .then((resultDownload) => {
              getShortLink(resultDownload.dlink)
                .then((resultShortLink) => {
                  resolve({
                    success: true,
                    message: "Success Convert",
                    title: resultDownload.title,
                    bitrate: resultDownload.fquality,
                    type: resultDownload.ftype,
                    link: resultShortLink,
                  });
                })
                .catch(() => {
                  reject({ success: false, message: "Internal Server Error" });
                });
            })
            .catch(() => {
              reject({ success: false, message: "Internal Server Error" });
            });
        } else {
          reject({ success: false, message: "Please Input Valid URL" });
        }
      })
      .catch(() => reject({ success: false, message: "Please Input Valid URL" }));
  });

module.exports = convertYt;
