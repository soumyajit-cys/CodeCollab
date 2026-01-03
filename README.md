Collaborative Coding Platform

A production-ready, full-stack collaborative coding platform that delivers a VS Code–like in-browser editor, real-time multi-user collaboration, video conferencing with screen sharing, secure authentication, private messaging, an AI coding assistant, and a scalable user dashboard.

This system is designed to operate at scale, handle hostile input, and support concurrent real users with low latency and strong security guarantees.

🚀 Key Features
Core Capabilities

VS Code–like in-browser code editor (Monaco Editor)

Real-time collaborative editing with conflict resolution

Live video conferencing & screen sharing (WebRTC)

WhatsApp-style private 1:1 messaging

AI-powered coding assistant

User dashboard with profiles, sessions, and presence

Secure, modern JWT-based authentication

Production Guarantees

Low-latency updates

Horizontal scalability

Secure data handling

Graceful degradation under load

Observability-ready architecture

🏗️ Architecture Overview

The platform follows a clean, modular, service-oriented architecture.

Browser
  ├── REST APIs (FastAPI)
  ├── WebSockets (Socket.IO)
  ├── WebRTC (P2P Media)
  ↓
Nginx (TLS, Reverse Proxy)
  ↓
FastAPI Services (Async)
  ├── Auth & User Management
  ├── Dashboard & Profiles
  ├── Collaboration Engine
  ├── Chat Service
  ├── AI Assistant
  ↓
PostgreSQL | Redis | Optional MongoDB

🧱 Technology Stack
Frontend (Strict)

HTML5 (semantic)

CSS3

Tailwind CSS

JavaScript (ES6+)

Monaco Editor

Socket.IO Client

WebRTC Browser APIs

Fetch API

Backend (Strict)

Python 3.11+

FastAPI (async-first)

Python Socket.IO

JWT (access + refresh tokens)

Structured logging

Centralized error handling

Schema-based validation

Data Layer

PostgreSQL – core relational data

Redis – presence, rate limiting, caching, pub/sub

MongoDB (optional) – chat messages

DevOps & Infrastructure

Docker (multi-stage builds)

Nginx (reverse proxy, TLS, WebSockets)

GitHub Actions (CI/CD)

Environment-based configuration

Horizontal scaling ready

📦 Implemented Modules
Module 1 — Authentication & User Management

Secure signup & login

JWT access/refresh token rotation

Email verification

Role-based authorization

Secure cookies

Session tracking

Module 2 — Code Editor

Monaco Editor integration

Multi-language support

File & folder tree

Auto-save with debounce

State recovery

Module 3 — Real-Time Collaboration

WebSocket room lifecycle

Presence tracking

Cursor sharing

Permission enforcement

Conflict resolution (CRDT/OT)

Secure room authorization

Module 4 — Chat System

One-to-one private messaging

Real-time delivery

Message persistence

Read receipts

Typing indicators

Phone-number-based discovery

Module 5 — Video & Screen Sharing

WebRTC signaling server

ICE candidate handling

STUN/TURN integration

Screen sharing

Call lifecycle management

Module 6 — AI Coding Assistant

Secure AI service abstraction

Context-aware prompt construction

Monaco Editor integration

Rate limiting & abuse protection

Module 7 — Dashboard & Profiles

User dashboard

Active session visibility

Profile management

Presence indicators

Connection/follow system

🔐 Security Considerations

JWT-based stateless authentication

Refresh token rotation

Strict input validation

Rate limiting via Redis

CSRF-safe cookie configuration

No client-controlled identifiers

Secure WebSocket authorization

Assumes hostile input by default

📊 Load & Scalability Strategy

REST APIs load-tested with k6

WebSocket stress testing for collaboration

Redis pub/sub pressure testing

PostgreSQL index and query analysis

WebRTC signaling load validation

Horizontal scaling validation

Chaos testing (Redis / DB failures)

🧪 Testing Strategy

Unit tests for services and schemas

Integration tests for APIs

WebSocket event validation

Load & stress testing

Failure injection testing

⚙️ Local Development Setup
Prerequisites

Docker & Docker Compose

Node.js 18+

Python 3.11+

PostgreSQL

Redis

Environment Variables

Create a .env file:
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/app
REDIS_URL=redis://redis:6379/0
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
AI_API_KEY=your_ai_provider_key

Run Backend
docker-compose up --build

Run Frontend
serve frontend/

🧭 Project Philosophy

This project is built with the assumption that:

The application will be publicly deployed

Real users will depend on it

Failures must be controlled, observable, and recoverable

Security is a baseline, not a feature

Code must be readable, testable, and extensible

There are no toy implementations in this repository.


📈 Future Enhancements

Kubernetes deployment

Autoscaling policies

Distributed tracing

Advanced permission models

Plugin system for editor extensions

📜 License

MIT License

👤 Author

Soumyajit Dutta
GitHub: https://github.com/soumyajit-cys

LinkedIn: https://www.linkedin.com/in/soumyajit-dutta2005/







