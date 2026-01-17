import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/create-bet", "routes/create-bet.tsx"),
  route("/group/:id", "routes/group.tsx"),
  route("/join-group", "routes/join-group.tsx"),
  route("/bet/:id", "routes/bet.tsx"),
] satisfies RouteConfig;
