const axios = require("axios");
const FormData = require("form-data");
const base64img = require("./base64img");
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

const getStories = (uname, num) =>
  new Promise((resolve, reject) => {
    axios.get(`https://igs.sf-converter.com/api/profile/${uname}`).then((resultProfile) => {
      const id = resultProfile.data.result.id;
      console.log(`Success Get ID : ${id}`);
      const number = parseInt(num) - 1;
      axios
        .get(`https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${id}`, {
          headers: {
            cookie:
              "ig_did=5AA76504-3084-45A8-B85F-CAB5351D9512; mid=X7GGZgALAAELxlute2wS3-63TXgY; ig_nrcb=1; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=45009829221; sessionid=45009829221%3AsFEVzd91IiX8O5%3A11; csrftoken=zUBe4AzqrwMpyvUjzpxtoJ7vFukBvUHx; rur=ASH; fbsr_124024574287414=MG0-DHi66VmQyMNHpOR69jNUlKdGmb0tmE4a6vghvsE.eyJ1c2VyX2lkIjoiMTAwMDQxNTAwNzc3NDcwIiwiY29kZSI6IkFRQUVwMS1uOVhNOEF4RjlfQkEwTzFkbVNhSDlNRlRwNlpDS19kNUZHa2dBYThQbHJLTlAwQTBoQV9KdFNrSWxHS2V2SUhubXoydG9jd0JJTlM1X1FWLU5oZ3ZkSmduTTdic1pHdVdrMFh6d0JGS3I0VjBwN3VfN0R2MEVGczExQXcyYm9MbndDaFk0TEJMNmU3eWJCYWRzMl9vbklENW1MSjNYR0h4aGxUcE1kdkszRllWM3NfMjVPbDNHWXRDU0lQMHkyWjNHVTdGa1c5WHZib3VuZDVDb3EzejN2TGZuN0p6bkxUZnVIVUgwdWYxMENoMndNcjV0U3RRNEZCc2QwY19IenVONUtnZkRwTHUxLUtDWnFWVzlYdm1PWHJ4VWloeV9kUDRQeWlKZTRTVm5ENjB6TVBINVBrb2FnYU13WGxQa0VHaGxtc0hoVVhTWkM4LXBCQkVyIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUhqOUpqREVyU1htV0hqWXA2R0I3bnU3M0tqaFRldEp6djBXQzJVb09TMWtyUEdhRHFrcG0wUU12WkFnYWtzSWlLcWNaQXRFeE94ejBUUmVxYUFiUVdpT3VydnJ6Z2UzcEtTVUxCeHBpaFVDSEhYU1haQVBjVHlQVmwxcFZ5blA2Z0JIUHFweENaQk05M3EzaVpCQUdBWkJwYWpUdUNkUGN1WVpBOHg3WkFpeTNTdkw1VzlsQ3FNWkQiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTYyMjI5NDM5N30",
            "x-asbd-id": "437806",
            "x-ig-app-id": "1217981644879628",
          },
        })
        .then(async (resultStories) => {
          if (resultStories.data.reels[id].items[number].media_type === 1) {
            await base64img(
              resultStories.data.reels[id].items[number].image_versions2.candidates[0].url
            )
              .then((resultBase64) => {
                resolve({ type: "image", ...resultBase64 });
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            resolve({
              type: "video",
              data: await getShortLink(
                resultStories.data.reels[id].items[number].video_dash_manifest
                  .split("<BaseURL>")[1]
                  .split("</BaseURL>")[0]
                  .replace(/&amp;/g, "&")
              ),
            });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  });

module.exports = { getDataDownload, getStories };
