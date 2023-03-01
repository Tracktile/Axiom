 <p  align="center">A very opinionated API client with built in caching, offline storage, validation, and more. Powered internally by @tanstack/react-query</p>

## Features

- :muscle: Based on [Tanstack Query](https://github.com/TanStack/query) and [Typebox](https://github.com/sinclairzx81/typebox).

- :pencil2: Define your API models once and use them anywhere in your App.

- :lock: Automatically validate request and response data against your defined model.

- :necktie: Optimistic mutations by default.

## Installation

```sh
  npm install @tracktile/axiom
  # OR
  yarn add @tracktile/axiom
```

## Usage

```typescript
import {createApiModel, createApi } from '@tracktile/axiom';

# Create an API Model
export const User = createApiModel({
  name: "User",
  resource: "/users",
  schema: Type.Object({
    id: Type.String(),
    email: Type.String(),
    firstName: Type.String(),
    lastName: Type.String(),
    enabled: Type.Boolean(),
  }),
});

# Create an API from your models
const api = createApi({ User })

const MyReactComponent = () => {
  # Access stateful queries and mutations with accurate type safety, inferred from your models.
  const { data: users, isLoading: isLoadingUsers, dataUpdatedAt: usersUpdatedAt } = api.User.search();
  const { mutate: createUser, isLoading: isCreatingUser} = api.User.create()
  return (
    <div>{JSON.stringify(user)}</div>
    <div>Fetched: {usersUpdatedAt}</div>
    <button onPress={() => createUser({
      id: uuid(),
      email: "new@user.com",
      firstName: "New",
      lastName: "User",
      enable: true
    })}>Add</button>
  )
}

export default MyReactComponent;

```

## Examples

Small example projects can be found in the [examples/](./examples) folder.

## Authors

- [@jarredkenny](https://www.github.com/jarredkenny)
