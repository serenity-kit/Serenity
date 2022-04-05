# Testing registration of user 'abc123'

```graphql
mutation {
  initializeRegistration(
    input: {
      username: "abc123"
      challenge: "lMFWgiRy4-sIVsB2MigzV4JuGTBNyUPT2v2pU-WZ8gg"
    }
  ) {
    serverPublicKey
    oprfPublicKey
    oprfChallengeResponse
  }
}
```
