const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listSchema = Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  items: [
    {
      text: { type: String, required: true },
      date: { type: Number, required: true },
    },
  ],
});

listSchema.methods.addItem = async function (item) {
  try {
    const newListItems = [...this.items];

    newListItems.push({ text: item, date: new Date() });

    this.items = newListItems;

    await this.save();
  } catch (err) {
    console.log(err);
  }
};

listSchema.methods.deleteItem = async function (itemId) {
  try {
    const oldListItems = [...this.items];

    const newListItems = oldListItems.filter((i) => {
      return i._id.toString() !== itemId;
    });

    this.items = newListItems;

    await this.save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoose.model("List", listSchema);
