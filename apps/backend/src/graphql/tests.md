## Testing registration of user 'abc123'

### Initialize Registration

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

### Finalize Registration

```graphql
mutation {
  finalizeRegistration(
    input: {
      username: "abc123"
      secret: "kKV2MCeMRmhTCAVCYVYm5NDaDKM6_WjAZyXTjr5wXTXy6jtNRkpnuZTKz_h9Bga0LxIYQ48yM0sMO4Jra9x7y9_ofoMzQX8boBn8UAgYsETu44y6Y2q9wWnkq5GVjjzNQ1iJyFPjm_pX46task2v-wDOmK_ROpqgX1llIpYzDkFNcRxr0OSdWeHyIAUHD1emGBc2uaR5SoNE3MzUj0jBTV6996p_PysuRUM154_6_Z0pxpOwgD1UkiDOg0zHv5U0NTrtf9xYfOMuLua6TTK9N8U"
      nonce: "U-sZ9C9h4Ub3jt_MqxMiOJEIr4X0TUgG"
      clientPublicKey: "hxLdSECgCz7hgwL0FqTj06jhSTMa-pLpCNN3NdZ__zw"
    }
  ) {
    status
  }
}
```

## Testing login of user 'abc123'

### Initialize Login

```graphql
mutation {
  initializeLogin(
    input: {
      username: "abc123"
      challenge: "lMFWgiRy4-sIVsB2MigzV4JuGTBNyUPT2v2pU-WZ8gg"
    }
  ) {
    secret
    nonce
    oprfPublicKey
    oprfChallengeResponse
  }
}
```

### Finalize Login

```graphql
mutation {
  initializeLogin(
    input: {
      username: "abc123"
      sharedTx: "lMFWgiRy4-sIVsB2MigzV4JuGTBNyUPT2v2pU-WZ8gg"
      sharedRx: "lMFWgiRy4-sIVsB2MigzV4JuGTBNyUPT2v2pU-WZ8gg"
    }
  ) {
    secret
    nonce
    oprfPublicKey
    oprfChallengeResponse
  }
}
```
