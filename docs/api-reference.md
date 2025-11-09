# UnfilteredUK API Reference

This document describes the public HTTP and WebSocket API endpoints provided by the UnfilteredUK backend. All endpoints are prefixed with `/api` and served over HTTPS in production. JSON is used for request and response bodies unless otherwise noted.

## Authentication

### Register

`POST /api/auth/register`

Create a new user account. Clients must generate their own encryption key pair for full privacy but the server generates one if omitted.

**Request Body**

| Field | Type | Description |
|---|---|---|
| `username` | string | Unique display name of the user. |
| `email` | string | User's email address. |
| `password` | string | Plaintext password which will be hashed server‑side. |

**Response**

| Field | Type | Description |
|---|---|---|
| `token` | string | JWT used to authenticate subsequent requests. |
| `user.id` | string | Obfuscated user identifier. |
| `user.username` | string | Username. |
| `user.publicKey` | string | Base64 encoded public key for E2EE. |
| `user.roles` | string[] | Array of roles assigned to the user. |

### Login

`POST /api/auth/login`

Authenticate a user and receive a JWT.

**Request Body**

| Field | Type | Description |
|---|---|---|
| `username` | string | The user's username. |
| `password` | string | The user's password. |

**Response** – Same as registration response.

## Servers

### Get Servers

`GET /api/servers`

List all servers the authenticated user belongs to.

**Headers**

`Authorization: Bearer <token>`

**Response**: Array of server summaries.

### Create Server

`POST /api/servers`

Create a new server.

**Headers**

`Authorization: Bearer <token>`

**Request Body**

| Field | Type | Description |
|---|---|---|
| `name` | string | Name of the server. |
| `description` | string | (Optional) Description of the server. |

**Response**

| Field | Type | Description |
|---|---|---|
| `id` | string | Obfuscated ID of the new server. |
| `name` | string | Server name. |
| `description` | string | Description. |
| `defaultChannelId` | string | ID of the default general channel. |

## Messages

### Get Messages

`GET /api/messages/:channelId`

Retrieve the last 50 messages for a given channel. Requires membership.

**Headers**

`Authorization: Bearer <token>`

**Response**: Array of messages sorted by creation time ascending.

### Send Message

`POST /api/messages/:channelId`

Send a message to a channel. The content should be encrypted client‑side and encoded as base64.

**Headers**

`Authorization: Bearer <token>`

**Request Body**

| Field | Type | Description |
|---|---|---|
| `content` | string | Base64 encoded encrypted message content. |

**Response**

```json
{
  "success": true
}
```

## Administration

Administrative endpoints require the authenticated user to have the `admin` or `root` role.

### Ban User

`POST /api/admin/ban`

Ban a user from a server.

**Request Body**

| Field | Type | Description |
|---|---|---|
| `serverId` | string | Raw MongoDB ID of the server. |
| `userId` | string | Raw MongoDB ID of the user to ban. |

## WebSocket API

Connect to the WebSocket server using Socket.IO. Provide the JWT in the `auth.token` option.

```js
const socket = io('https://unfiltereduk.example.com', {
  auth: { token }
});
socket.emit('join', channelId);
socket.on('message', (msg) => {
  console.log('New message', msg);
});
socket.emit('send', { channelId, content });
```

## Error Handling

Errors are returned with appropriate HTTP status codes and a JSON body containing an `error` string. Clients should display these messages to users where appropriate and handle status codes such as 401 (unauthenticated) and 403 (forbidden) by redirecting or showing an error.