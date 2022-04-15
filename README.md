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

### App (web)

```sh
cd apps/app
yarn dev:web
```

### App (iOS Simulator or Android Emulator)

We are using the Expo dev client you need to download and install a dev build first which can be found in [https://github.com/SerenityNotes/app-builds](https://github.com/SerenityNotes/app-builds).

```sh
cd apps/app
yarn dev:ios
yarn dev:android
```

Creating a dev build for iOS Simulator.

```sh
eas build --profile development-simulator --platform ios
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

For any package:

```sh
cd packages/libsodium
yarn test
```

or

```sh
yarn workspace @serenity-tools/libsodium test
```

## Deploy

Backend deployment icluding running migrations is done via Github Actions.
Frontend deployment is setup in Netlify.

## Folder/File Naming Convention

- Folder and file names use camelCase.
- Folders start with a lower case character.
- TypeScript, Json and other files start with a lower case character.
  - React components are the only exception as they start with an upper case character.
