# Varsome Proxy Dev

Varsome Proxy dev stack.

## Requirement

- [Docker](https://www.docker.com)

## Setup

Create `.env` file :

```
cp .env.sample .env
```

Deploy stack :

```
docker compose up -d
```

## Containers

Get proxy container bash :

```
docker compose exec proxy bash
```

Get Postgres CLI :

```
docker compose exec postgres psql -U postgres
```
