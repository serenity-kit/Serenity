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

### App (web)

```sh
cd apps/app
yarn dev:web
```

### App (iOS Simulator or Android Emulator)

```sh
cd apps/app
yarn dev:ios
yarn dev:android
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

## Folder/File Naming Convention

- Folder and file names use camelCase.
- Folders start with a lower case character.
- TypeScript, Json and other files start with a lower case character.
  - React components are the only exception as they start with an upper case character.
