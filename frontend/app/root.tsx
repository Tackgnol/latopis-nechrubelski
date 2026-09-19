import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initErrorReporting } from "~/lib/error-reporting";
import "./app.css";

export { DocumentLayout as Layout } from "~/components/templates/DocumentLayout/DocumentLayout";
export { ErrorScreen as ErrorBoundary } from "~/components/organisms/ErrorScreen/ErrorScreen";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(initErrorReporting, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
