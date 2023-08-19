import request from "supertest";

import { Service } from "../service";
import { Controller } from "../controller";

export function testController(controller: Controller) {
  const app = new Service({
    title: "Test",
    prefix: "/",
    controllers: [controller],
  });
  app.init();
  return request(app.callback());
}
