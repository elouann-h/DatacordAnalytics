const express = require("express");
const fs = require("fs");
const main = require("./main.js");

const app = express();

const ipData = {};
const currentIpData = {};

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));

app.get("/", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress).split(":")[3];
    const directory = fs.existsSync("./package/activity/analytics");

    if (!(ip in ipData)) {
        res.render("index", { canBeReloaded: true, directory });
    }
    else {
        res.redirect("data");
    }

    if (!currentIpData[ip]) {
        currentIpData[ip] = true;
        let data = {};
        if (fs.existsSync("./package/activity/analytics")) {
            const dirContent = fs.readdirSync("./package/activity/analytics");
            if (dirContent.length > 0) {
                const filePath = "./package/activity/analytics/" + dirContent[0];
                data = await main.processLineByLine(filePath);
            }
        }

        ipData[ip] = data;
    }
});

app.get("/data", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress).split(":")[3];
    res.render("data", { data: ipData[ip] });
});

const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});