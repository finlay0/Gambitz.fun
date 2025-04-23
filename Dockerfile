FROM node:20-alpine
WORKDIR /app
COPY scripts ./scripts
RUN npm install -g ts-node typescript
CMD ["ts-node", "scripts/data/collect_pgn.ts"] 