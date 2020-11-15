FROM rust:1.47-buster

WORKDIR /var/local/rust

COPY Cargo.toml .
COPY ./src ./src

RUN pwd
RUN ls
RUN cargo build

CMD ["cargo", "run", "main.rs"]