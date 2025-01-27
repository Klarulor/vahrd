FROM 'node'

WORKDIR /app

COPY package.json package.json
COPY tsconfig.json tsconfig.json
RUN npm install

COPY build-internal.sh /check_errors.sh

RUN echo '#!/bin/sh' > /check_errors.sh && \
    echo 'make check | tee /tmp/make_check_output && \
    if grep -i error /tmp/make_check_output; then \
      echo "Build failed due to errors in make check."; \
      exit 1; \
    fi' >> /check_errors.sh && \
    chmod +x /check_errors.sh

COPY src src

CMD [ "npx", "ts-node", "src/index.ts" ]