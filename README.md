 <p  align="center">
  <img  src="https://i.imgur.com/w98C6Oy.png"  />
</p>
 
 <p  align="center">Build APIs and consume them in React apps with complete type safety, optimistic mutations, and offline first functionality.</p>

## Features

- :muscle: Based on [Tanstack Query](https://github.com/TanStack/query) and [Typebox](https://github.com/sinclairzx81/typebox), [Koa](https://github.com/koajs/koa), and [openapi3-ts](https://github.com/metadevpro/openapi3-ts).

- :pencil2: Define your API models once and use them anywhere in your App, frontend or backend.

- :lock: Automatically validate request and response data against your defined model.

- :necktie: Optimistic mutations by default.

- :notebook_with_decorative_cover: Automatically generates an OpenAPI schema describing your API as YAML or JSON.

- :battery: Deploy your API as microservice, or a modular monolith to AWS Lambda using our provided CDK construct.

- :runner: Run all of your services in a single process for local development. Deploy as separate services.

## Installation

```sh
  npm install @tracktile/axiom
```

## Usage

### Models

```typescript
import { createModel, T } from "@tracktile/axiom";

// Declare a model to be used across your app.
export const User = createModel({
  name: "User",
  resource: "/users",
  model: T.Object({
    id: T.String(),
    name: T.String(),
    email: T.String(),
    enabled: T.Boolean(),
  }),
  create: T.Object({
    name: T.String(),
    email: T.String(),
  }),
});
```

### Client

```typescript

import { createProcedure, T } from '@tracktile/axiom';
import { createUseApiHook, createApiProvider } from "@tracktile/axiom/client";

// Create a procedure
// Procedures are not cached and represent RPC calls
export const SendAlert = createProcedure({
  name: "SendAlert",
  method: "post",
  resource: "/events",
  params: T.Object({
    message: T.String(),
    time: T.String({ format: "date-time" }),
  }),
  result: T.Boolean(),
});

// Collect your models
  const models = { User }

// Collect your procedures
const fns = { SendAlert }

// Create an APIProvider based on your models
const ApiProvider = createApiProvider({ models, fns });

// Create a useApi hook based on your models
const useApi = createUseApiHook({ models, fn });

// Use them to access your API in your application!
// Queries are cached and retried automatically
// Mutations are optimistic by default and retry forever

const MyAwesomeComponent = () => {
  // Access stateful queries and mutations with accurate type safety, inferred from your models.
  const { data: users, isLoading: isLoadingUsers, dataUpdatedAt: usersUpdatedAt } = api.User.search();

  // Use offline first optimistic mutations
  const { mutate: createUser, isLoading: isCreatingUser} = api.User.create()

  // Invoke your bound RPC style calls
  const { run: sendAlert } = api.SendAlert.run({
    // And pass mutation options based on the call
    retry: true,
  });

  return (
    <>
      <div>{JSON.stringify(user)}</div>
      <div>Fetched: {usersUpdatedAt}</div>
      <button onPress={() => createUser({
        name: 'My User',
        email: 'user@users.com',
      })}>Add</button>
      <button onPress={sendAlert}>Add</button>
    </>
  )
}

const App = () =>
  <ApiProvider baseUrl="https://my.awesome.backend">
    <MyAwesomeComponent>
  </ApiProvider>
```

### Server

```typescript
import { T } from "@tracktile/axiom";
import { Service, Controller, serverless } from "@tracktile/axiom/server";

const controller = new Controller({
  tags: ["example"],
});

controller.addOperation(
  {
    name: "CreateUser",
    method: "post",
    path: "/users",
    req: User.schemas.create,
    res: User.schemas.model,
  },
  async (ctx, next) => {
    // ctx.request.body is validated and type inferred as User.schemas.create
    // Create and return the user
    return next();
  }
);

const service = new Service({
  title: "example",
  description: "Example service",
  version: "1.0.0",
  controllers: [controller],
});

// Start a local server
service.start(3000);

// Or mount your API inside of an Lambda function
exports.handler = serverless(service);
```

### Generate OpenAPI Documentation

```sh
axiom --in=./myService.ts --out=./my-api-schema.yaml --yaml
OR
axiom --in=./myCombinedServices.ts --out=./my-api-schema.json --json
```

## Examples

Small example project can be found in the [example/](./example) folder.

## Authors

- [@jarredkenny](https://www.github.com/jarredkenny)
