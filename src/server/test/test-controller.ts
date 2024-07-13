import request from "supertest";

import { Controller } from "../controller";
import { Service } from "../service";

export function testController(controller: Controller) {
  const app = new Service({
    title: "Test",
    prefix: "/",
    controllers: [controller],
  });
  app.init();
  return request(app.callback());
}
