import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":locale", "routes/locale-layout.tsx", [
    index("routes/locale-index.tsx"),
    route("psalm/:num", "routes/psalm.tsx"),
  ]),
] satisfies RouteConfig;
