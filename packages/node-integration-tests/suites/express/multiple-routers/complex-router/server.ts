import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import express from 'express';

const app = express();

Sentry.init({
  dsn: 'https://public@dsn.ingest.sentry.io/1337',
  release: '1.0',
  // eslint-disable-next-line deprecation/deprecation
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

const APIv1 = express.Router();

APIv1.use(
  '/users/:userId',
  APIv1.get('/posts/:postId', (_req, res) => {
    Sentry.captureMessage('Custom Message');
    return res.send('Success');
  }),
);

const router = express.Router();

app.use('/api', router);
app.use('/api/api/v1', APIv1.use('/sub-router', APIv1));

app.use(Sentry.Handlers.errorHandler());

export default app;
