import compression from 'compression';
import express from 'express';
import errorHandler from 'errorhandler';
import cors from 'cors';
import passport from 'passport';
import flash from 'express-flash';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import session from 'express-session';
import mongoose from 'mongoose';
import logger from './util/logger';

import { isAuthenticated } from './util/passport';
import { accountRoutes } from './routes';

const MongoStore = mongo(session);

const mongoUrl = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL || '';

mongoose.connect(mongoUrl, { useNewUrlParser: true }).catch((err) => {
  logger.error(
    `Error connecting to MongoDB. Please make sure it is running. ${err}`,
  );
  process.exit(1);
});

const app = express();

app.set('port', process.env.PORT || 3001);
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    store: new MongoStore({
      url: mongoUrl,
      autoReconnect: true,
    }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });

app.get('/', (_req, res) => {
  res.send('Hello World! 12345 asdf');
});

app.use('/account', isAuthenticated, accountRoutes);

app.use(errorHandler());

app.listen(app.get('port'), () => {
  logger.info(
    'ProAvalon is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env'),
  );
  logger.info('Press CTRL-C to stop\n');
});
