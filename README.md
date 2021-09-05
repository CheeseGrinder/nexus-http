<div align="center">
  <a href="https://github.com/CheeseGrinder/nexus-http" rel="noopener noreferrer" target="_blank">
    <img src="https://img.shields.io/github/license/CheeseGrinder/nexus-http"/>
  </a>
  <a href="https://www.npmjs.com/package/nexus-http" rel="noopener noreferrer" target="_blank">
    <img src="https://img.shields.io/npm/dm/nexus-http"/>
  </a>
  <a href="https://github.com/CheeseGrinder/nexus-http/actions" rel="noopener noreferrer" target="_blank">
    <img src="https://github.com/CheeseGrinder/nexus-http/actions/workflows/Node.Js.yml/badge.svg"/>
  </a>
</div>

## Description 📄

`nexus-http` is a simple http client that allows you to make requests easily with fetch API.

## Install 📦️

```bash
npm i --save nexus-http
```

## How to use ✏️

In a `ts` file this code works, in pure JS, just remove the extra typing from the `client.get` part.

```ts
import { NexusClient } from 'nexus-http';

// Several ways to create an instance
const client = new NexusClient();
const client = NexusClient.crete();
const client = NexusClient.crete({
  baseUrl: 'http://localhost:3000/',
  enableDebug: true,
});
class CheeseClient extends NexusClient {
  baseUrl: 'http://localhost:3000/';
  enableDebug: true;
}

// To make a get request
// In this case, we assume that we have defined a baseUrl.
client
  .get<{ message: string }>('/users', { page: 1, limit: 10 }) // final url : http://localhosst:3000/users?page=1&limit=10
  .fetch()
  .handle({
    success: data => {
      // data type: HttpResponse<{ message: string }>
      // Add some logic on success
    },
    error: err => {
      // err type : HttpResponse<HttpError>
      // Add some logic on error
    },
    complete: () => {
      // Add some logic after success or error
    },
  });
```

You can add body on `POST`, `PUT` and `PATCH`, otherwise its produce an error:
In a `ts` file this code works, in pure JS, just remove the extra typing from the `client.post` part.

```ts
// In this case, we assume that we have defined a baseUrl.
client
  .post<{ message: string }>('/users') // final url : http://localhosst:3000/users
  .body({
    username: 'CheeseGrinder',
  })
  .fetch()
  .handle({
    success: data => {
      // data type: HttpResponse<{ message: string }>
      // Add some logic on success
    },
    error: err => {
      // err type : HttpResponse<HttpError>
      // Add some logic on error
    },
    complete: () => {
      // Add some logic after success or error
    },
  });
```
