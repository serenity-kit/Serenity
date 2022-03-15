# Serenity

## Setup

Recommended node version: 16

```sh
yarn global add expo-cli
yarn global add eas-cli
yarn
```

## Development

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
yarn dev
# visit http://localhost:8080 in your browser
```
