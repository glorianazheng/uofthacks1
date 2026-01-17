import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("explore", "routes/explore.tsx"),
  route("create", "routes/create.tsx"),
  route("circles", "routes/circles.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
