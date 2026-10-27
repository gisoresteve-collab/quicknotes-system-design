QuickNotes System Architecture

1. Overview

QuickNotes is a note-taking system that allows users to create, view, update, and delete notes. The proposed architecture separates the client, application services, background processing, caching, and database storage to support growth and reliability.

The frontend practice project uses JSONPlaceholder. This document describes the proposed architecture for a real QuickNotes service.

2. Functional Requirements

Users can create, view, update, and delete their notes.

Users can organize notes with tags.

Users can retrieve notes in pages rather than loading all notes at once.

Users must authenticate before accessing their private notes.

Users can search and filter their notes.

The system validates note titles and request data.

3. Nonfunctional Requirements

Scalability: Support an estimated one million registered users.

Availability: Avoid relying on a single application server or database instance.

Performance: Return common note-list requests quickly using indexes and caching where appropriate.

Security: Authenticate users, authorize access to notes, and use HTTPS.

Maintainability: Separate frontend, API, database, and background processing responsibilities.

Data integrity: Use database constraints and backups to protect stored notes.

4. Architecture Diagram

                      +------------------+
                      |   Web / Mobile   |
                      |      Client      |
                      +--------+---------+
                               |
                               v
                      +------------------+
                      |       DNS        |
                      +--------+---------+
                               |
                               v
                      +------------------+
                      |       CDN        |
                      | Static Frontend  |
                      +--------+---------+
                               |
                               v
                      +------------------+
                      |  Load Balancer   |
                      +--------+---------+
                               |
                    +----------+----------+
                    |                     |
                    v                     v
            +---------------+     +---------------+
            | Application   |     | Application   |
            | Server A      |     | Server B      |
            +-------+-------+     +-------+-------+
                    |                     |
                    +----------+----------+
                               |
                     +---------+---------+
                     |                   |
                     v                   v
              +-------------+      +-------------+
              | Cache       |      | Primary DB  |
              |             |      | Read/Write  |
              +-------------+      +------+------+
                                         |
                                         v
                                  +-------------+
                                  | Read Replica|
                                  | Read Queries|
                                  +-------------+

            Application Server
                    |
                    v
              +-------------+
              | Message     |
              | Queue       |
              +------+------+
                     |
                     v
              +-------------+
              | Background  |
              | Worker      |
              +-------------+

5. Component Responsibilities

Web/Mobile Client: Provides the user interface for creating and managing notes.

DNS: Resolves the QuickNotes domain to the appropriate service endpoint.

CDN: Delivers static frontend assets from geographically distributed locations.

Load Balancer: Distributes API requests across healthy application servers.

Application Servers: Validate requests, authenticate users, enforce permissions, and implement note operations.

Cache: Stores selected frequently accessed data temporarily to reduce repeated database reads.

Primary Database: Stores authoritative users, notes, tags, and relationships; handles writes and primary reads.

Read Replica: Serves eligible read queries and reduces read pressure on the primary database, subject to replication delay.

Message Queue: Holds asynchronous tasks so application requests do not need to wait for all background work.

Background Worker: Processes queued tasks such as notifications, exports, or other deferred work.

The CDN is primarily for static assets; API requests still need to reach the application service. The cache must not bypass authentication or authorization checks.

6. Capacity Estimates for One Million Users

These are planning estimates, not measured production traffic. They reuse the following assumptions:

Registered users: 1,000,000.

Daily active users: 20% of registered users, or 200,000.

Each daily active user creates 5 notes per day.

Each daily active user loads notes 20 times per day.

Average stored note size: 500 bytes.

Approximate day length for calculation: 100,000 seconds.

Write traffic

Daily note creations:

200,000 × 5 = 1,000,000 notes/day

Average writes per second:

1,000,000 ÷ 100,000 = 10 writes/second

Assuming peak traffic is five times the average:

10 × 5 = 50 writes/second

Read traffic

Daily note-list loads:

200,000 × 20 = 4,000,000 loads/day

Average reads per second:

4,000,000 ÷ 100,000 = 40 reads/second

Assuming peak traffic is five times the average:

40 × 5 = 200 reads/second

These read estimates count note-list requests, not every individual database row or query generated by each request.

Annual storage estimate

Assuming each created note occupies approximately 500 bytes before indexes, backups, and additional metadata:

1,000,000 × 500 bytes × 365 = 182,500,000,000 bytes/year

This is approximately 182.5 GB using decimal units, or about 180 GB/year when rounded for planning.

Actual storage will be higher when indexes, metadata, replicas, backups, and other database overhead are included. The estimate also assumes notes are created at the same rate throughout the year.

7. Request Flow: GET /notes

The client sends an authenticated GET /v1/notes request over HTTPS.

DNS resolves the QuickNotes domain.

The request reaches the load balancer, which selects a healthy application server.

The application server validates the access token and checks that the user is authorized to access the requested notes.

The application checks the cache for an eligible matching result.

If the cache does not contain the required data, the application queries the database. Suitable reads may use the read replica if its consistency characteristics are acceptable.

The application returns the notes as JSON, including pagination metadata.

The client displays the returned notes.

8. Request Flow: POST /notes

The client sends an authenticated POST /v1/notes request containing the title and optional body as JSON.

DNS resolution and the load balancer direct the request to a healthy application server.

The application validates the access token, checks permissions, and validates the request body.

The application writes the new note to the primary database and obtains its generated ID and timestamps.

The application invalidates or updates relevant cached note-list data.

If an asynchronous task is needed, such as sending a notification, the application publishes a message to the queue.

The application returns 201 Created with the created note.

A background worker processes the queued task independently.

The database write must succeed before the API reports that the note was created. Queue processing is not a replacement for saving the note itself.

9. Trade-offs

Cache performance versus freshness

Caching can reduce database load and improve response times. However, cached notes may become stale after an update or deletion. The application should invalidate or refresh affected cache entries and avoid caching sensitive data across users.

Read replicas versus consistency

Read replicas distribute read traffic and help the system scale. However, replication can lag behind the primary database. Requests that must immediately reflect a recent write should use the primary database or another strategy that guarantees the required consistency.

Asynchronous work versus complexity

A queue allows slow background tasks to run outside the main request. It introduces additional operational complexity, including retries, duplicate-message handling, monitoring, and dead-letter processing.

More servers versus operational cost

Multiple application servers improve capacity and allow traffic to continue when one server fails. They also increase deployment, monitoring, and infrastructure costs.

10. Avoiding Single Points of Failure

Run multiple application servers across separate failure domains and configure health checks on the load balancer.

Deploy redundant load-balancing and DNS arrangements through the selected cloud provider.

Use a managed database with automated backups, monitoring, and a documented failover plan.

Configure read-replica promotion or another tested database recovery process for primary database failure.

Make the cache recoverable because it contains temporary data, not the only copy of a note.

Deploy redundant queue infrastructure and workers, with retries and monitoring for failed jobs.

Test backup restoration and failover procedures rather than relying only on their configuration.

11. Conclusion

This architecture separates user-facing requests from data storage and background processing. Load balancing, caching, database indexing, read replicas, and asynchronous workers provide options for scaling the system as demand increases. Capacity estimates should be reviewed against actual traffic and storage measurements as the service grows.