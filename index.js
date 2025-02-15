const express = require("express"); //"import" Express framework
const morgan = require("morgan"); // "import" Morgan middleware
const cors = require("cors");
const app = express(); //Assign express to app

app.use(cors());
app.use(express.json()); // Add this line to parse JSON payloads (request.body)

const date = new Date();

//Custom Morgan token to show request.body as a string
morgan.token("body", (req) => JSON.stringify(req.body));

//Morgan config
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body ")
);

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

// Custom middleware that logs request info
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method); // Logs the HTTP method of the request
  console.log("Path:  ", request.path); // Logs the path of the request
  console.log("Body:  ", request.body); // Logs the body of the request
  console.log("---"); // Logs a separator for readability
  next(); // Passes control to the next middleware function
};

//call custom middleware "requestLogger"
app.use(requestLogger);

//own middleware to catch requests made to non-exist routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

//Function to generate Person ID for GET PERSON REST API
const generateId = () => {
  const maxId =
    persons.length > 0
      ? Math.max(...persons.map((person) => Number(person.id)))
      : 0;

  return String(maxId + 1);
};

//REST API'S BELOW-------------------------

//GET PERSONS
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

//GET INFO
app.get("/info", (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`);
});

//GET PERSON by Id
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

//call custom middleware "unknownEndpoint"
app.use(unknownEndpoint);

//REST API'S ABOVE-------------------------

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
