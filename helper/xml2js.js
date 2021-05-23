const axios = require("axios");
const parseString = require("xml2js").parseString;
const fs = require("fs");
const weatherKey = {
  ["0"]: {
    id: "Cerah",
    en: "Clear Skies",
  },
  ["1"]: {
    id: "Cerah Berawan",
    en: "Partly Cloudy",
  },
  ["2"]: {
    id: "Cerah Berawan",
    en: "Partly Cloudy",
  },
  ["3"]: {
    id: "Berawan",
    en: "Mostly Cloudy",
  },
  ["4"]: {
    id: "Berawan Tebal",
    en: "Overcast",
  },
  ["5"]: {
    id: "Udara Kabur",
    en: "Haze",
  },
  ["10"]: {
    id: "Berasap",
    en: "Smoke",
  },
  ["45"]: {
    id: "Berkabut",
    en: "Fog",
  },
  ["60"]: {
    id: "Hujan Ringan",
    en: "Light Rain",
  },
  ["61"]: {
    id: "Hujan Sedang",
    en: "Rain",
  },
  ["63"]: {
    id: "Hujan Lebat",
    en: "Heavy Rain",
  },
  ["80"]: {
    id: "Hujan Lokal",
    en: "Isolated Shower",
  },
  ["95"]: {
    id: "Hujan Petir",
    en: "Severe Thunderstorm",
  },
  ["97"]: {
    id: "Hujan Petir",
    en: "Severe Thunderstorm",
  },
};

const getJson = (url) =>
  new Promise(async (resolve, reject) => {
    await axios
      .get(url)
      .then((result) => {
        parseString(result.data, function (err, resultJson) {
          if (err) {
            reject(err.message);
          } else {
            resolve(resultJson);
          }
        });
      })
      .catch((err) => {
        reject(err.message);
      });
  });

(async () => {
  const urlBase = [
    "Aceh",
    "Bali",
    "BangkaBelitung",
    "Banten",
    "Bengkulu",
    "DIYogyakarta",
    "DKIJakarta",
    "Gorontalo",
    "Jambi",
    "JawaBarat",
    "JawaTengah",
    "JawaTimur",
    "KalimantanBarat",
    "KalimantanSelatan",
    "KalimantanTengah",
    "KalimantanTimur",
    "KalimantanUtara",
    "KepulauanRiau",
    "Lampung",
    "Maluku",
    "MalukuUtara",
    "NusaTenggaraBarat",
    "NusaTenggaraTimur",
    "Papua",
    "PapuaBarat",
    "Riau",
    "SulawesiBarat",
    "SulawesiSelatan",
    "SulawesiTengah",
    "SulawesiTenggara",
    "SulawesiUtara",
    "SumateraBarat",
    "SumateraSelatan",
    "SumateraUtara",
    "Indonesia",
  ];
  const resultArr = [];
  for (let i = 0; i < urlBase.length; i++) {
    const url = `https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-${urlBase[i]}.xml`;
    const data = await getJson(url);
    const normalizeJson = {
      issue: {
        year: parseInt(data.data.forecast[0].issue[0].year[0]),
        month: parseInt(data.data.forecast[0].issue[0].month[0]),
        day: parseInt(data.data.forecast[0].issue[0].day[0]),
        hour: parseInt(data.data.forecast[0].issue[0].hour[0]),
        minute: parseInt(data.data.forecast[0].issue[0].minute[0]),
        second: parseInt(data.data.forecast[0].issue[0].second[0]),
      },
      provinsi: urlBase[i],
      area: data.data.forecast[0].area.map((area) => {
        if (area.parameter) {
          return {
            kabupaten: area.name[1]["_"],
            humadity: {
              hourly: area.parameter[0].timerange.map((item) => {
                return {
                  time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                  value: `${item.value[0]["_"]}%`,
                };
              }),
              daily: {
                max: area.parameter[1].timerange.map((item) => {
                  return {
                    time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                    value: `${item.value[0]["_"]}%`,
                  };
                }),
                min: area.parameter[3].timerange.map((item) => {
                  return {
                    time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                    value: `${item.value[0]["_"]}%`,
                  };
                }),
              },
            },
            temperature: {
              hourly: area.parameter[5].timerange.map((item) => {
                return {
                  time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                  value: `${item.value[0]["_"]}°C`,
                };
              }),
              daily: {
                max: area.parameter[2].timerange.map((item) => {
                  return {
                    time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                    value: `${item.value[0]["_"]}°C`,
                  };
                }),
                min: area.parameter[4].timerange.map((item) => {
                  return {
                    time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                    value: `${item.value[0]["_"]}°C`,
                  };
                }),
              },
            },
            weather: {
              hourly: null,
              daily: {
                max: area.parameter[6].timerange.map((item) => {
                  return {
                    time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                    value: weatherKey[item.value[0]["_"]],
                  };
                }),
                min: null,
              },
            },
            windDirection: {
              hourly: area.parameter[7].timerange.map((item) => {
                return {
                  time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                  value: `${item.value[0]["_"]} deg`,
                };
              }),
              daily: null,
            },
            windSpeed: {
              hourly: area.parameter[8].timerange.map((item) => {
                return {
                  time: `${item["$"].datetime[0]}${item["$"].datetime[1]}${item["$"].datetime[2]}${item["$"].datetime[3]}-${item["$"].datetime[4]}${item["$"].datetime[5]}-${item["$"].datetime[6]}${item["$"].datetime[7]} ${item["$"].datetime[8]}${item["$"].datetime[9]}:${item["$"].datetime[10]}${item["$"].datetime[11]}`,
                  value: `${item.value[1]["_"]} MPH`,
                };
              }),
              daily: null,
            },
          };
        } else {
          return { kabupaten: area.name[1]["_"] };
        }
      }),
    };
    resultArr.push(normalizeJson);
  }
  fs.writeFileSync("dataCuaca.json", JSON.stringify(resultArr));
})();
