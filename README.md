# Varsome Proxy

HTTP proxy that limits Varsome API data consumption.

## Setup

Create `.env` file :

```
cp .env.sample .env
```

Install dependencies :

```
npm install
```

Run migration :

```
npm run migration
```

## Proxy

Start proxy :

```
npm run start
```

Request proxy :

```
GET http://localhost:3000/facts
```

Reset proxy

```
npm run reset
```

## Lint / Test

Run linter :

```
npm run lint
```

Run tests :

```
npm run test
```

Run tests with coverage :

```
npm run test:cov
```
