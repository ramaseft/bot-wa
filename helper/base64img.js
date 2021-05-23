const imageToBase64 = require("image-to-base64");

const base64img = (url) =>
  new Promise((resolve, reject) => {
    imageToBase64(url) // Image URL
      .then((response) => {
        let mimetype = "";
        if (url.match(/\.jpg|\.jpeg/)) {
          mimetype = "image/jpeg";
        } else {
          mimetype = "image/png";
        }
        resolve({
          mimetype,
          data: response,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports = base64img;
