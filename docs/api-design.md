QuickNotes API Design

1. Overview

The QuickNotes API allows users to create, retrieve, update, and delete notes. It also supports searching notes and managing tags.

The API follows REST principles and uses JSON for request and response bodies. The endpoints below describe the proposed QuickNotes backend API. The frontend practice project uses JSONPlaceholder, which simulates API requests and does not permanently save changes.

Base URL: https://api.quicknotes.example/v1

Content type: application/json

2. API Endpoints

Method

Endpoint

Description

Success status

GET

/notes

Retrieve the authenticated user's notes

200 OK

GET

/notes/{id}

Retrieve one note by ID

200 OK

POST

/notes

Create a new note

201 Created

PUT

/notes/{id}

Replace an existing note

200 OK

PATCH

/notes/{id}

Partially update a note

200 OK

DELETE

/notes/{id}

Delete a note

204 No Content

GET

/tags

Retrieve the user's tags

200 OK

POST

/tags

Create a tag

201 Created

POST

/notes/{id}/tags

Associate a tag with a note

200 OK

DELETE

/notes/{id}/tags/{tagId}

Remove a tag association

204 No Content

All endpoints require authentication except any future public endpoints explicitly documented as public. Users may access only notes and tags they are authorized to use.

3. List Notes

Request

GET /v1/notes?limit=10&offset=0
Authorization: Bearer <access-token>

Successful response — 200 OK

{
  "data": [
    {
      "id": "note_101",
      "title": "Meeting notes",
      "body": "Prepare the project update.",
      "userId": "user_12",
      "createdAt": "2026-10-20T09:00:00Z",
      "updatedAt": "2026-10-20T09:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}

The limit parameter controls the maximum number of returned notes. The offset parameter specifies how many notes to skip.

4. Create a Note

Request

POST /v1/notes
Authorization: Bearer <access-token>
Content-Type: application/json

Request body

{
  "title": "Meeting notes",
  "body": "Prepare the project update."
}

The title is required and must not exceed 100 characters. The body is optional.

Successful response — 201 Created

{
  "data": {
    "id": "note_102",
    "title": "Meeting notes",
    "body": "Prepare the project update.",
    "userId": "user_12",
    "createdAt": "2026-10-20T10:00:00Z",
    "updatedAt": "2026-10-20T10:00:00Z"
  }
}

The server generates the note ID and timestamps and associates the note with the authenticated user.

5. Error Responses

The API uses appropriate HTTP status codes to communicate failures.

Status

Meaning

Example situation

400 Bad Request

Invalid request

Missing title or title exceeds 100 characters

401 Unauthorized

Authentication required or invalid

Missing or expired access token

403 Forbidden

Access denied

User attempts an operation they are not permitted to perform

404 Not Found

Resource not found

Requested note does not exist or is unavailable to the user

500 Internal Server Error

Unexpected server failure

An unhandled backend error occurs

Example error response — 400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must not exceed 100 characters."
  }
}

Example error response — 401 Unauthorized

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Valid authentication is required."
  }
}

6. Design Considerations

Resource-based URLs: Notes and tags are represented as resources.

HTTP methods: GET reads data, POST creates resources, PUT replaces resources, PATCH updates selected fields, and DELETE removes resources.

Validation: The server validates incoming data even when the frontend performs its own validation.

Authentication and authorization: The API identifies the user and checks permission for each protected resource.

Consistent errors: Error responses use a predictable JSON structure.

Pagination: Listing notes supports pagination to avoid returning an unlimited number of records.

Security: The backend must never trust user-supplied ownership identifiers to grant access to another user's notes.