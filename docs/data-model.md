QuickNotes Data Model

1. Overview

QuickNotes uses a relational database to store users, notes, tags, and the relationships between notes and tags.

2. Entities and Columns

Users

Column

Type

Constraints

id

BIGINT

Primary key

name

VARCHAR(100)

NOT NULL

email

VARCHAR(255)

UNIQUE, NOT NULL

created_at

TIMESTAMP

NOT NULL

Notes

Column

Type

Constraints

id

BIGINT

Primary key

user_id

BIGINT

Foreign key referencing users.id

title

VARCHAR(100)

NOT NULL

body

TEXT

Nullable

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

Tags

Column

Type

Constraints

id

BIGINT

Primary key

user_id

BIGINT

Foreign key referencing users.id

name

VARCHAR(50)

NOT NULL

created_at

TIMESTAMP

NOT NULL

Note_Tags

Column

Type

Constraints

note_id

BIGINT

Primary key component; foreign key referencing notes.id

tag_id

BIGINT

Primary key component; foreign key referencing tags.id

The composite primary key (note_id, tag_id) prevents the same tag from being associated with the same note more than once.

3. Relationships

Users to Notes — one-to-many: One user can own many notes, but each note belongs to one user.

Users to Tags — one-to-many: One user can create many tags, but each tag belongs to one user.

Notes to Tags — many-to-many: A note can have multiple tags, and a tag can be applied to multiple notes. The note_tags junction table implements this relationship.

4. SQL Table Definitions

The following examples use PostgreSQL-compatible SQL.

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

5. Example Queries

Query 1: Retrieve all notes belonging to a user

SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;

This retrieves the user's notes, placing the most recently updated notes first.

Query 2: Find notes and their tags using JOIN

SELECT n.id, n.title, t.name AS tag_name
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 1
ORDER BY n.id;

This joins notes, the junction table, and tags to show the tags associated with each note.

Query 3: Count notes belonging to each user

SELECT u.id, u.name, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY note_count DESC;

The LEFT JOIN includes users who have no notes.

6. Indexing

CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);

This index supports queries that retrieve a user's notes ordered by the most recently updated. It can reduce the amount of data the database needs to scan and sort.

The database's primary-key and unique constraints also create indexes where supported by PostgreSQL.

7. SQL vs NoSQL

A relational SQL database is a suitable choice for QuickNotes because users, notes, and tags have clear relationships. Foreign keys and transactions help maintain data integrity, while JOIN queries make it possible to retrieve notes with their tags.

A NoSQL database can be useful when flexible document structures or particular scaling patterns are more important. However, for this system's structured relationships and integrity requirements, a relational database is a straightforward starting point.