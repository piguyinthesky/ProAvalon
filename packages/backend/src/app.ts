import express from 'express';
import errorHandler from 'errorhandler';
import cors from 'cors';
import logger from './util/logger';

const app = express();

app.set('port', process.env.PORT || 3001);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (_req, res) => {
  res.send('Hello World!12345 asdf');
});

app.use(errorHandler());

app.listen(app.get('port'), () => {
  logger.info(
    'ProAvalon is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env'),
  );
  logger.info('Press CTRL-C to stop\n');
});
