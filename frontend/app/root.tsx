import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConsentBanner } from "~/components/organisms/ConsentBanner/ConsentBanner";
import { trackPage } from "~/lib/analytics";
import { initErrorReporting } from "~/lib/error-reporting";
import "./app.css";

export { DocumentLayout as Layout } from "~/components/templates/DocumentLayout/DocumentLayout";
export { ErrorScreen as ErrorBoundary } from "~/components/organisms/ErrorScreen/ErrorScreen";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const { pathname, search } = useLocation();

  useEffect(initErrorReporting, []);

  useEffect(() => {
    trackPage();
  }, [pathname, search]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ConsentBanner />
    </QueryClientProvider>
  );
}
