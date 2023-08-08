## Device relationship

Workspace chain

User devices chain

Document chain

1. User Alice has Device A & B and makes changes. Device B is removed. How can we verify that B is not making changes anymore?

Workspace chain:

1. Create Workspace with Alice
2. Alice adds Bob to workspace

User devices chain:

1. Alice creates Device A
2. Alice creates Device B
3. Alice remove Device B

## Workspace chain

- Add device
- Remove device

How do we deal with web devices?
How do we deal with share page devices?

## Device Management

### Events

#### Create device chain

Main device adds itself to the chain

#### Add Device

Main device adds a new device to the chain

- add the current workspace chain entries (can't do for all workspaces since this would give away the workspace list)

IDEA:

- do a device chain per workspace?

#### Remove Device

- add an entry to the device chain and connect it to a workspace chain event

#### Add Temporary device (not in the chain)

Main device adds a web device (not to the chain, but has a timeout)

- must reference the start point for a workspace chain
- must reference the end point (eventually?)

## Invitations timeout

1. Alice creates an invite with a timeout of 1 day
2. Bob accepts (server verifies)
3. Any admin invalidates the invite

## Document chain

Document chain entry:

- reference to workspace chain 2
