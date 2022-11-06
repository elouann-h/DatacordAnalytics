const fs = require("fs");
const readline = require("readline");

async function processLineByLine(filePath) {
    const time1 = new Date();
    console.log("started at", time1);
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });
    const events = {};
    let i = 1;
    for await (const line of rl) {
        try {
            const json = JSON.parse(line);
            if (json?.event_type in events) events[json?.event_type || "null_event"]++;
            else events[json?.event_type || "null_event"] = 1;
        }
        catch (err) {
            console.log("error while reading line", i, err.message);
        }
        i++;
        if (i % 100000 === 0) {
            console.log("processed", i, "lines");
        }
    }
    const sortedEvents = Object.entries(events).sort((a, b) => b[1] - a[1]);
    const sortedEventsObject = {};
    for (const [evtName, evtAmount] of sortedEvents) {
        sortedEventsObject[evtName] = evtAmount;
    }
    const time2 = new Date();
    return { sortedEventsObject, start: time1, end: time2, duration: time2.getTime() - time1.getTime() };
}

module.exports = { processLineByLine };