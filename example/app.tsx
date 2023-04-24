import React from "react";

import { User } from "./models/user";
import { createApiProvider, createUseApiHook } from "../src";

const models = { User };

const useApi = createUseApiHook<typeof models>();
const ApiProvider = createApiProvider<typeof models>();

const token = "TOKEN";

function Users() {
  const { User } = useApi();
  const { data: users = [], isLoading, refetch } = User.search();
  const { mutate: createUser } = User.create();

  const handleAddUser = () =>
    createUser({
      id: "uuid",
      name: "John Doe",
      email: "john.doe@company.com",
      status: "active",
    });

  if (isLoading) {
    return <div>Loading Users...</div>;
  }
  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email} - {user.status}
        </div>
      ))}
      <button onClick={handleAddUser}>Add User</button>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

function App() {
  return (
    <ApiProvider
      models={models}
      token={token}
      baseUrl="https://gorest.co.in/public/v2"
    >
      <Users />
    </ApiProvider>
  );
}

export default App;
