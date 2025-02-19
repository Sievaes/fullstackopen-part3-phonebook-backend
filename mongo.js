const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
//process.argv[2] is the third argument when running "node mongo.js <password>"
const password = process.argv[2];

const url = `mongodb+srv://masteruser:${password}@cluster0.1nwly.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=PhonebookApp`;

//sets that that queries sent to database doesnt have to be in schema for the query to return data.
mongoose.set("strictQuery", false);

mongoose.connect(url);

//To disable pluralize
// mongoose.pluralize(null);

//"schematic" for the mongoose data structure
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: `${process.argv[3]}`,
  number: `${process.argv[4]}`,
});
//if no arguments passed other than "node mongo.js <password>" it will list all stored contacts
if (process.argv.length < 5) {
  Person.find().then((persons) => {
    persons.map((person) =>
      console.log("Name:", `${person.name},`, "Number:", person.number)
    );

    mongoose.connection.close();
  });
  return;
}

//save new note to mongo with "node mongo.js <password> contactName contactNumber"
person.save().then((result) => {
  console.log(
    `added`,
    process.argv[3],
    "number",
    process.argv[4],
    "to the phonebook"
  );
  mongoose.connection.close();
});
