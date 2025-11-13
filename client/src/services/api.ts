// client/src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

export const login = (username: string) =>
  api.post("/login", { username }).then(res => res.data.token);