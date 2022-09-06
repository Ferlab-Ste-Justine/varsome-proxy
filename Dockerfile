ARG image=node:18.4

FROM $image-slim AS build

COPY src /src
COPY .eslintrc.json /
COPY jest.config.json /
COPY package-lock.json /
COPY package.json /
COPY tsconfig.build.json /
COPY tsconfig.json /

RUN npm install
RUN npm run lint:ci
RUN npm run test:ci
RUN npm run build

FROM $image-alpine

COPY --from=build /dist /dist
COPY --from=build /package-lock.json /
COPY --from=build /package.json /

RUN npm install --omit=dev

ENV NODE_ENV=production
ENV NODE_PATH=dist

CMD node dist/cmd/migration latest && node dist
