 <p  align="center">
  <img  src="https://i.imgur.com/w98C6Oy.png"  />
</p>
 
 <p  align="center">A very opinionated API client with built in caching, offline storage, validation, and more. Powered internally by @tanstack/react-query</p>

## Features

- :muscle: Based on [Tanstack Query](https://github.com/TanStack/query) and [Typebox](https://github.com/sinclairzx81/typebox).

- :pencil2: Define your API models once and use them anywhere in your App.

- :lock: Automatically validate request and response data against your defined model.

- :necktie: Optimistic mutations by default.

## Installation

```sh
  npm install @tracktile/axiom
```

## Usage

```typescript
import { createModel, createProcedure, createApiProvider, T } from '@tracktile/axiom';

// Create an API Model
// Models come with offline and optimistic mutation by default.
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
    email: T.String()
  })
});

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

## Examples

Small example project can be found in the [example/](./example) folder.

## Authors

- [@jarredkenny](https://www.github.com/jarredkenny)
