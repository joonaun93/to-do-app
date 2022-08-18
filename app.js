const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const User = require("./models/user");

const appRoutes = require("./routes/app");

const password = "Ggknx1QvLxoNhbnC";
const mongoDB_URI = `mongodb+srv://testing:${password}@cluster0.qhsor90.mongodb.net/?retryWrites=true&w=majority`;

const store = new MongoDBStore({
  uri: mongoDB_URI,
  collection: "mySessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "My node project",
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.use(appRoutes);

(async () => {
  try {
    await mongoose.connect(mongoDB_URI);

    const currentUser = await User.find();

    if (currentUser.length === 0) {
      const newUser = await User.create({
        name: "Default User",
        email: "default email",
        password: "default password",
      });

      await newUser.save();
    }

    app.listen(3000);
  } catch (err) {
    console.log(err);
  }
})();
