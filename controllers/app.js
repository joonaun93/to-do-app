const List = require("../models/list");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.getMain = async (req, res, next) => {
  const user = await User.findOne({ email: req.session.user });

  const lists = await List.find({ user: user });

  const errorMessage = req.flash("error");

  res.render("main", {
    user: user,
    lists: lists,
    listDirectory: null,
    isMainPage: true,
    path: null,
    error: errorMessage.length > 0 ? errorMessage[0] : null,
  });
};

exports.postAddList = async (req, res, next) => {
  const user = await User.findOne({ email: req.session.user });
  const list = req.body.list.toLowerCase();

  try {
    const listExist = await List.findOne({ user: user, name: list });

    if (!listExist) {
      await List.create({
        user: user._id,
        name: list,
        items: {
          text: "Delete me and add your first to do item",
          date: new Date(),
        },
      });
    } else {
      req.flash("error", "List already exists!");
    }
  } catch (err) {
    console.log(err);
  }

  res.redirect(`/${list}`);
};

exports.postAddItem = async (req, res, next) => {
  const user = await User.findOne({ email: req.session.user });
  const input = req.body.input;
  const listName = req.body.name;

  try {
    const list = await List.findOne({ user: user, name: listName });

    // console.log(list);

    await list.addItem(input);
  } catch (err) {
    console.log(err);
  }
  res.redirect(`/${listName}`);
};

exports.getList = async (req, res, next) => {
  const user = await User.findOne({ email: req.session.user });
  const list = req.params.list.toLowerCase();
  const [toDoItems] = await List.find({ user: user, name: list });
  const lists = await List.find({ user: user });
  const errorMessage = req.flash("error");

  res.render("main", {
    user: user,
    toDoItems: toDoItems,
    lists: lists,
    path: `/${list}`,
    listDirectory: list,
    isMainPage: false,
    error: errorMessage.length > 0 ? errorMessage[0] : null,
  });
};

exports.postDeleteItem = async (req, res, next) => {
  const user = await User.findOne({ email: req.session.user });
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    const list = await List.findOne({ user: user, name: listName });
    await list.deleteItem(itemId);
  } catch (err) {
    console.log(err);
  }

  res.redirect(`/${listName}`);
};

exports.postDeleteList = async (req, res, next) => {
  const user = await User.findOne({ email: req.session.user });
  const listName = req.body.listName;

  try {
    const list = await List.findOne({ user: user, name: listName });
    await List.findByIdAndRemove(list._id);
  } catch (err) {
    console.log(err);
  }

  res.redirect(`/`);
};

exports.postLogIn = async (req, res, next) => {
  const logInEmail = req.body.logInEmail;
  const logInPassword = req.body.logInPassword;

  try {
    const user = await User.findOne({ email: logInEmail });

    if (user) {
      const match = await bcrypt.compare(logInPassword, user.password);
      if (match) {
        req.session.isAuthenticated = true;
        req.session.user = logInEmail;
      } else {
        req.flash("error", "Email or password is invalid! Please try again.");
      }
    } else {
      req.flash("error", "Email or password is invalid! Please try again.");
    }
  } catch (err) {
    console.log(err);
  }

  res.redirect("/");
};

exports.postSignUp = async (req, res, next) => {
  const signUpEmail = req.body.signUpEmail;
  const signUpPassword = req.body.signUpPassword;
  const signUpName =
    req.body.signUpName[0].toUpperCase() +
    req.body.signUpName.slice(1).toLowerCase();

  try {
    const hashPassword = await bcrypt.hash(signUpPassword, saltRounds);

    const user = await User.findOne({ user: signUpEmail });

    if (!user) {
      const newUser = await User.create({
        name: signUpName,
        email: signUpEmail,
        password: hashPassword,
        list: [],
      });
    } else {
      req.flash("error", "Email already exists! Please try again.");
    }
  } catch (err) {
    console.log(err);
  }

  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => (err ? console.log(err) : null));
  res.redirect("/");
};
