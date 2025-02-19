const express = require("express");
const app = express();
require("dotenv").config();

//IMPORT NOTE MODAL (MODELS/NOTE.JS)
const Note = require("./models/note");

//MAKES THE SERVER SERVE DIST FOLDER (INDEX.HTML) WHEN THE ROOT PATH IS CONNECTED IN BROWSER
app.use(express.static("dist"));

//REQUESTLOGGER MIDDLEWARE, WHICH IS CALLED ALATER IN THE CODE
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

//ERRORHANDLER MIDDLEWARE, WHICH IS CALLED AT THE END.
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(requestLogger);

//UNKNOWNENDPOINT MIDDLEWARE, WHICH IS CALLED AT THE END.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

//GET ALL NOTES
app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

//POST NOTE
app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

//GET NOTE BY ID
app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

//DELETE NOTE
app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

//UPDATE NOTE
app.put("/api/notes/:id", (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

//USE THE FOLLOWING MIDDLEWARE
app.use(unknownEndpoint);
app.use(errorHandler);

//PORT DEFINED IN .ENV, SERVERS LIKE RENDER DETERMINE ENV BY ITSELF.
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
