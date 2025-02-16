import * as Sentry from "@sentry/react";

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: 1.0,
    });
  }
}; 