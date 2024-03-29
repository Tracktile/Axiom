import React from "react";

import { User } from "../models/user";
import { SendEvent } from "./fns/send-event";
import { createApiProvider, createUseApiHook } from "../../src/client";

const models = { User };
const fns = { SendEvent };

const useApi = createUseApiHook({ models, fns });
const ApiProvider = createApiProvider({ models, fns });

function Users() {
  const api = useApi();

  const { data: users, isLoading } = api.User.query();
  const { mutate: createUser } = api.User.create();
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
      <button onClick={handleSendEvent}>Send Event</button>
    </div>
  );
}

export function App() {
  return (
    <ApiProvider baseUrl="https://gorest.co.in/public/v2">
      <Users />
    </ApiProvider>
  );
}
