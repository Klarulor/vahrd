FROM 'node'

WORKDIR /app

COPY package.json package.json
COPY tsconfig.json tsconfig.json
RUN npm install

COPY src src

CMD [ "npx", "ts-node", "src/index.ts" ]