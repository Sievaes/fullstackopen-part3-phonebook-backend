const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url)
  .then((result) => console.log("Connected to MongoDB"))
  .catch((error) => console.log("error connecting to MongoDB", error.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 3;
      },
      message: (props) =>
        `"${props.value}" is too short! Name should be at least 3 characters long. `,
    },
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{3}-\d{5,}$/.test(v);
      },
      message: (props) =>
        `"${props.value}" is not a valid phone number! It should be in the form of 000-00000.`,
    },
  },
});

const Person = mongoose.model("Person", personSchema);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
