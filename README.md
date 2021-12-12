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

In a `js` file remove the extra typing from the `nexusHttp.get` part and `.then`.

```ts
import { nexusHttp } from 'nexus-http';

nexusHttp.get<User[]>('http://localhost:3000/api/users', {
  query: {
    page: 1,
    limit: 12,
    deleted: false
  }
})
  .then((response: Response<User[]>) => {
      // Add some logic when status is >= 200 and <= 299
  })
  .catch((response: Response<HttpError>) => {
      // Add some logic on error
  })
  .finally(() => {
    // Add some logic after success or error
  });
```

With baseUrl:

```ts
import { nexusHttp } from 'nexus-http';

nexusHttp.setBaseUrl('http://localhost:3000/api/');

nexusHttp.get<User[]>('/users') // url before adding query params: http://localhost:3000/api/users
  .then((response: Response<User[]>) => {
      // Add some logic when status is >= 200 and <= 299
  })
  .catch((response: Response<HttpError>) => {
      // Add some logic on error
  })
  .finally(() => {
    // Add some logic after success or error
  });
```


Create your own instance:

```ts
import { NexusHttp } from 'nexus-http';

const nexusHttp = new NexusHttp();

nexusHttp.get<User[]>('http://localhost:3000/api/users')
  .then((response: Response<User[]>) => {
      // Add some logic when status is >= 200 and <= 299
  })
  .catch((response: Response<HttpError>) => {
      // Add some logic on error
  })
  .finally(() => {
    // Add some logic after success or error
  });
```


## Client
> if fetch is not supported, the client use XmlClient by default.
```ts
import { nexusHttp, XmlClient } from 'nexus-http';

const nexusHttp = new NexusHttp();
nexusHttp.useClient(XmlClient);
// Now this instance of nexusHttp use the XmlClient (XMLHttpRequest)

nexusHttp.get<User[]>('http://localhost:3000/api/users')
  .then((response: Response<User[]>) => {
      // Add some logic when status is >= 200 and <= 299
  })
  .catch((response: Response<HttpError>) => {
      // Add some logic on error
  })
  .finally(() => {
    // Add some logic after success or error
  });
```
