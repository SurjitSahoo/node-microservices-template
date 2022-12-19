<h1 align="center">Node.JS Microservices Template</h1>

- A template to quickly spin-up multiple microservices node applications.
- We get to share eslint and prettier configs across all of our libs and apps
- It's a monorepo setup with `yarn-workspaces`, no fancy monorepo tools.
- There are two main directories, `apps` and `libs`. All the libs and apps have their own `package.json` files.  
  **libs:**

  - Anything we want to reuse between our apps goes into the libs, e.g. logger, cache, database config to name a few, all of these should be our private node_modules, that we can import (install) in our apps (stuff in apps directory) and use them.
  - libs can depend on other libs but not on apps

  **apps:**

  - Apps are our microservice apps. These should be deployable individually.
  - Apps can depend on libs but not on other apps

## Folder Structure

```text
my-server
  ├── apps ------------------- Contains our microservices (individual apps)
  |   ├── app1
  │   └── app2
  |
  ├── libs ------------------- Re-usable libraries to be used
  │   ├── auth
  │   │   ├── package.json
  │   │   └── src
  |   |
  │   ├── cache
  │   │   ├── package.json
  │   │   └── src
  |   |
  │   ├── constants
  │   │   └── package.json
  |   |
  │   ├── logger
  │   │   └── package.json
  |   |
  │   └── sequelize-config
  │       └── package.json
  |
  ├── database ---------------- To be used by sequelize-cli to run migrations and setting up test data
  │   ├── config
  │   ├── migrations
  │   └── seeders
  │
  ├── .husky ------------------ Central git-hooks
  ├── .eslintrc.json ---------- Central eslint config
  ├── .prettierrc ------------- Central prettier config
  ├── .prettierignore
  ├── .sequelizerc ------------ Sequelize-cli config
  ├── .env
  ├── .gitignore
  ├── docker-compose.yml
  ├── package.json.example ---- sample package.json file for creating re-usable libraries
  ├── package.json ------------ Root package.json file, configures the workspaces and installs common dev dependencies
  └── yarn.lock
```
