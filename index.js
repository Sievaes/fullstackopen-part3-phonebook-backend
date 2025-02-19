require("dotenv").config();
const express = require("express"); //"import" Express framework
const morgan = require("morgan"); // "import" Morgan middleware
const cors = require("cors");
const app = express(); //Assign express to app
const Person = require("./models/person");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json()); // Add this line to parse JSON payloads (request.body)

const date = new Date();

//ERRORHANDLER MIDDLEWARE, WHICH IS CALLED AT THE END.
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

//Custom Morgan token to show request.body as a string
morgan.token("body", (req) => JSON.stringify(req.body));
//Morgan config
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body ")
);

// let persons = [
//   {
//     id: "1",
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: "2",
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: "3",
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: "4",
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

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

//REST API'S BELOW-------------------------

//GET INFO
app.get("/info", (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`);
});

//GET PERSONS
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => {
      next(error);
    });
});

//GET PERSON BY ID
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      response.send(person);
    })
    .catch((error) => {
      next(error);
    });
});

//DELETE PERSON
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

//ADD PERSON
app.post("/api/persons/", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or Number missing",
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      next(error);
    });

  // Person.find({ name: body.name })
  //   .then((existingPerson) => {
  //     if (existingPerson.length > 0) {
  //       return response.status(400).json({
  //         error: "Name already in the list",
  //       });
  //     } else {
  //       const person = new Person({
  //         name: body.name,
  //         number: body.number,
  //       });

  //       person
  //         .save()
  //         .then((savedPerson) => {
  //           response.json(savedPerson);
  //         })
  //         .catch((error) => {
  //           next(error);
  //         });
  //     }
  //   })
  //   .catch((error) => {
  //     next(error);
  //   });
});

//UPDATE PERSON
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

//REST API'S ABOVE-------------------------

//call custom middleware "unknownEndpoint"
app.use(errorHandler);
app.use(unknownEndpoint);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
