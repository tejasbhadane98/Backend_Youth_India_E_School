const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const pug = require("pug");
dotenv.config();

const app = express();
const PORT = process.env.Node_ENV || 3000

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly"
]

app.get("/", (req, res) => {
    const response = `
    <h1> <center> Welcome to the Youth India E-School <center> </h1>
    <br> <br> 
    <h3>To see Google Calendar integration Using Rest API, you need to change the URL to: /rest/v1/calendar/init/  </h3>
  `;
    res.send(response);
})
app.get("/rest/v1/calendar/init/", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes
    })
    res.redirect(url)
    // res.send("Its Working!!!");
})


app.get("/rest/v1/calendar/redirect", async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log(tokens);
        // res.send("Its Working!!!");

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = response.data.items;
        // res.json(events);
        // console.log(events);
        const renderCalendar = pug.compileFile("calendar.pug");
        const html = renderCalendar({ events });
        // console.log(events);
        res.send(html);
        // res.send("Its Working!!!");
    }
    catch (e) {
        console.error('Error retrieving calendar events:', e);
        res.status(500).json({ error: 'An error occurred while retrieving calendar events' });
    }

})

app.listen(PORT, () => {
    console.log("Server is listening at port no", PORT);
})