# quicknotes-system-design
QuickNotes API client and system design documentation
QuickNotes System Design

QuickNotes is a learning project that demonstrates a REST API client and the system design of a note-taking application. The project covers retrieving, creating, and deleting notes, REST API design, relational data modelling, and scalable system architecture.

The frontend practice client uses JSONPlaceholder, a public practice API. Changes made through this API are simulated and are not permanently saved.

Features

Load notes from a REST API.

Create notes using HTTP POST.

Delete notes using HTTP DELETE.

Validate note titles, which are required and limited to 100 characters.

Display loading, success, error, and empty states.

Document proposed REST endpoints and JSON responses.

Model users, notes, tags, and note-tag relationships in SQL.

Describe a scalable architecture with caching, load balancing, database replicas, and background processing.

How to Run the API Client

Prerequisites

Node.js is not required for this basic static frontend.

A modern web browser.

An internet connection to access JSONPlaceholder.

Run locally

Clone the repository:

git clone https://github.com/gisoresteve-collab/quicknotes-system-design.git

Open the project folder:

cd quicknotes-system-design

Open index.html in a browser, or use the VS Code Live Server extension if installed.

Load notes, create a test note, and try deleting a note.

The client sends requests to JSONPlaceholder. Because it is a practice API, simulated changes may not remain after reloading the page.

Documentation

API Design — endpoints, HTTP methods, JSON examples, and error responses.

Data Model — entities, relationships, SQL table definitions, queries, and indexing.

Architecture — requirements, scaling estimates, architecture diagram, request flows, and trade-offs.

What I Learned

REST API integration: How to send GET, POST, and DELETE requests using fetch, check HTTP responses, and handle request failures.

Data modelling: How primary keys, foreign keys, and junction tables represent relationships in a relational database.

System design: How load balancers, caches, read replicas, queues, and background workers can support a growing application.

Git version control: How to organize work into meaningful commits and maintain a documented project history.

Project Scope

This is an educational project, not a production-ready note-taking service. The API design and architecture documents describe a proposed QuickNotes backend; the running frontend uses JSONPlaceholder rather than that backend.

The project is not intended to imply that a production database, authentication service, queue, or distributed infrastructure has been deployed.

