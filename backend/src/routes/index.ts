import express from "express";

import { defaultRoutes } from "./defaultRoutes";
import { customersRoutes } from "./customers";
import { paymentsRoutes } from "./payments";

export const routes = express.Router();

routes.use(defaultRoutes);
routes.use(customersRoutes);
routes.use(paymentsRoutes);
