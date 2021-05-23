const fs = require("fs");

const data = fs.readFileSync("dataCuaca.json", { encoding: "utf-8" });
console.log(fs.existsSync("dataCuaca.json"));
