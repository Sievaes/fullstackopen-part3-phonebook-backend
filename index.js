const express = require("express");
const app = express();
app.use(express.json()); // Add this line to parse JSON payloads

const date = new Date();

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

//GET PERSONS
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`);
});

//GET PERSON
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (!person) {
    response.status(404).send(`<p>Person not found</p>`);
    console.log(`Person not found!`);
  } else {
    response.send(person);
  }
});

//DELETE PERSON
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
  console.log(`Person delete`);
});

const generateId = () => {
  const maxId =
    persons.length > 0
      ? Math.max(...persons.map((person) => Number(person.id)))
      : 0;

  return String(maxId + 1);
};

//ADD PERSON
app.post("/api/persons/", (request, response) => {
  const body = request.body;
  console.log("Following body is being sent to the server:", body);

  if (!body.name || !body.number) {
    console.log("Name or Number missing");
    return response.status(400).json({
      error: "Name or Number missing",
    });
  } else if (persons.find((person) => person.name === body.name)) {
    console.log(body.name, "already in the list");
    return response.status(400).json({
      error: "Name already in the list",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
