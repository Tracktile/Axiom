import React from "react";

import { User } from "./models/user";
import { createApiProvider, createUseApiHook } from "../src";

const models = { User };

const useApi = createUseApiHook({ models });
const ApiProvider = createApiProvider({ models });

function Users() {
  const api = useApi();
  const { data: users, isLoading, fetchNextPage } = api.User.query();
  const { mutate: createUser } = User.create();

  const handleAddUser = () =>
    createUser({
      name: "John Doe",
      email: "john.doe@company.com",
    });

  if (isLoading) {
    return <div>Loading Users...</div>;
  }
  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email} - {user.status}
        </div>
      ))}
      <button onClick={handleAddUser}>Add User</button>
      <button onClick={() => fetchNextPage()}>Load More</button>
    </div>
  );
}

function App() {
  return (
    <ApiProvider models={models} baseUrl="https://gorest.co.in/public/v2">
      <Users />
    </ApiProvider>
  );
}

export default App;
