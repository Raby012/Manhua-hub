import express from "express";

const app = express();
app.get("/api/proxy/mangadex/*", (req, res) => {
    res.json({ matched: true, params: req.params });
});
app.get("*", (req, res) => {
    res.send("<!doctype html><html><body>Fallback</body></html>");
});

app.listen(3001, () => console.log("Listening"));
