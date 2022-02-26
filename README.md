# Serenity

## Setup

```sh
yarn global add expo-cli
yarn global add eas-cli
yarn
```

## Development

### Editor (standalone)

```sh
cd packages/editor
yarn dev
# visit http://localhost:8080 in your browser
```

### App (web)

```sh
cd apps/app
yarn dev:web
```

### App (iOS Simulator)

```sh
cd apps/app
yarn dev:ios
```

### App (Electron)

```sh
cd apps/app
yarn dev:electron-web
# in another tab run
yarn dev:electron-main
```
