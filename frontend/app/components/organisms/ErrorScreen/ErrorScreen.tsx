import { useEffect } from "react";
import { isRouteErrorResponse } from "react-router";
import { Sentry } from "~/lib/error-reporting";
import type { ErrorScreenProps } from "./ErrorScreen.models";
import "./ErrorScreen.styles.css";

export function ErrorScreen({ error }: ErrorScreenProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!notFound) Sentry.captureException(error);
  }, [error, notFound]);

  return (
    <main className="error-screen">
      <h1>{notFound ? "404" : "Coś poszło nie tak"}</h1>
      <p>{notFound ? "Tej strony nie ma w Latopisie." : "Latopis się rozsypał. Odśwież stronę."}</p>
    </main>
  );
}
