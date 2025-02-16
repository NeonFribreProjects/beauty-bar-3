import * as Sentry from "@sentry/react";

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  console.error(error);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  }
}; 