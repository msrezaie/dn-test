require("dotenv").config();
require("express-async-errors");
const { scheduleJobToSelectActivity } = require("./utils/chosenActivityConfig");
const mongoose = require("mongoose");
const path = require("node:path");
const express = require("express");

const { PORT = 8000, MONGODB_URI } = process.env;

// imports
const app = express();
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Socket server import
const socketServer = require("./utils/socketConfig");

// api documentation: swagger-ui
const swaggerDocument = require("yamljs").load(
  path.join(__dirname, "swagger.yaml")
);
const swaggerUi = require("swagger-ui-express");

// routers
const activitiesRouter = require("./routes/activitiesRouter");
const eventsRouter = require("./routes/eventsRouter");
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const groupsRouter = require("./routes/groupsRouter");
const messagesRouter = require("./routes/messagesRouter");

// middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { authenticateUser } = require("./middleware/authHandler");

// we shall change the cors origin once the frontend is deployed
app.use(
  cors({
    origin: [process.env.ORIGIN, "http://localhost:3000"],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    key: "user_sid",
    cookie: { maxAge: 1000 * 60 * 60 * 12 },
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      collection: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./utils/passportConfig")(passport);

// routes
app.get("/", (req, res) => {
  res.send(
    '<h2>Welcome to Data-Night API home page!</h2><a href="/api-docs">Documentation</a>'
  );
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", authenticateUser, eventsRouter);
app.use("/api/v1/activities", activitiesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/groups", authenticateUser, groupsRouter);
app.use("/api/v1/messages", authenticateUser, messagesRouter);

app.use(notFound);
app.use(errorHandler);

// Main server initialization
const server = app.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    scheduleJobToSelectActivity();
    console.log(`Listening on PORT http://localhost:${PORT}/`);
  } catch (error) {
    console.log(error);
  }
});

// Socket server initialization
socketServer(server, {
  cors: {
    origin: [process.env.ORIGIN, "http://localhost:3000"],
  },
});
