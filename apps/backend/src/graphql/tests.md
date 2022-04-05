# Testing registration of user 'abc123'

```graphql
{
  initializeRegistration(
    input: { username: "abc123", challenge: "blah blah blah" }
  ) {
    serverPubKey
    oprfPubKey
    challengeResponse
  }
}
```
