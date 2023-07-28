import React from "react";

import { User } from "./models/user";
import { SendEvent } from "./fns/send-event";
import { createApiProvider, createUseApiHook } from "../src";

const models = { User };
const fns = { SendEvent };

const useApi = createUseApiHook({ models, fns });
const ApiProvider = createApiProvider({ models, fns });

function Users() {
  const api = useApi();
  const { data: users, isLoading, fetchNextPage } = api.User.query();
  const { mutate: createUser } = User.create();
  const { run: sendEvent } = api.SendEvent.run({ retry: true });

  const handleAddUser = () => {
    createUser({
      name: "John Doe",
      email: "john.doe@company.com",
    });
  };

  const handleSendEvent = () => {
    sendEvent({
      name: "user-created",
      userId: "123",
      time: new Date().toISOString(),
    });
  };

  const handleLoadMore = () => fetchNextPage();

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
      <button onClick={handleLoadMore}>Load More</button>
      <button onClick={handleSendEvent}>Send Event</button>
    </div>
  );
}

function App() {
  return (
    <ApiProvider baseUrl="https://gorest.co.in/public/v2">
      <Users />
    </ApiProvider>
  );
}

export default App;
