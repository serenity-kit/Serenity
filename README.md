# Serenity

## Setup

Recommended node version: 16

```sh
yarn global add expo-cli
yarn global add eas-cli
yarn
cp apps/backend/.env.example apps/backend/.env
```

## Development

### Backend

```sh
docker-compose up # to start the postgres instance
# open another tab
yarn workspace backend prisma migrate dev
yarn workspace backend dev
```

Preview the database:

```sh
yarn prisma studio
```

To reset the database:

```sh
yarn prisma migrate reset
```

As an alternativ you can start the backend without a DB connection a mocked GraphQL setup:

```sh
yarn workspace backend dev:mock
```

### App (web)

```sh
cd apps/app
yarn dev
```

### App (iOS Simulator or Android Emulator)

We are using the Expo dev client you need to download and install a dev build first which can be found in [https://github.com/SerenityNotes/app-builds](https://github.com/SerenityNotes/app-builds).

```sh
cd apps/app
yarn dev
# in the console press `i` for iOS or `a` for Android or use the Expo Web-interface
```

Creating a dev build for iOS Simulator.

```sh
cd apps/app
yarn eas build --profile development-simulator --platform ios
```

Creating a dev build for iOS.

```sh
cd apps/app
yarn eas build --profile development --platform ios
```

Build new graphql types

```sh
yarn build:graphql-types
```

### App (Electron)

```sh
cd apps/app
yarn dev:electron-web
# in another tab run
yarn dev:electron-main
```

### Editor (standalone)

```sh
cd packages/editor
yarn style:editor --watch
# in another tab run
yarn dev
# visit http://localhost:8080 in your browser
```

## Tests

For backend:

```sh
docker-compose up # to start the postgres instance
# in another tab
yarn workspace backend test
```

To reset the test DB migrations run:

```sh
cd apps/backend
POSTGRES_URL=postgres://prisma:prisma@localhost:5432/serenity_test yarn prisma migrate reset
```

For any package:

```sh
cd packages/libsodium
yarn test
```

or

```sh
yarn workspace @serenity-tools/libsodium test
```

## End-to-end tests

To develop the tests run

```sh
docker-compose up
## in another tab run
yarn workspace backend dev:e2e
## in another tab run
yarn workspace serenity dev:e2e
## in another tab run
yarn workspace backend test:e2e
```

The tests will use a separate database for the tests and a separate expo webpack server on http://localhost:3000/

The tests on the CI run with production build. The commands are available in the Github Actions file.

When writing e2e tests don't rely on generated CSS classes since they might be different on the production build which is used for running the e2e tests
on the CI servers.

## Deploy

Backend deployment icluding running migrations is done via Github Actions.
Frontend deployment is setup in Netlify.

## Folder/File Naming Convention

- Folder and file names use camelCase.
- Folders start with a lower case character.
- TypeScript, Json and other files start with a lower case character.
  - React components are the only exception as they start with an upper case character.
