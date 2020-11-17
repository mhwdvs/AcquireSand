FROM rust:1.47-buster

WORKDIR /var/local/rust

COPY . .

RUN cargo build

CMD ["cargo", "run", "main.rs"]