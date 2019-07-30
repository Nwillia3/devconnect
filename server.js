const app = require("exoress")();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Port running...");
});

app.listen(PORT, () => {
  console.log(`Server started on ${port}`);
});
