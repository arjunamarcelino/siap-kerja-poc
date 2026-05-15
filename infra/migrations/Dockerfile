FROM ghcr.io/amacneil/dbmate:2
COPY db/ /db/
ENTRYPOINT ["dbmate", "--wait", "--no-dump-schema", "--migrations-dir", "/db/migrations", "up"]
