FROM mcr.microsoft.com/devcontainers/typescript-node:24

RUN apt-get update && \
  apt-get install -y gnupg locales && \
  sed -i -E 's/# (ja_JP.UTF-8)/\1/' /etc/locale.gen && locale-gen

ENV LANG=ja_JP.UTF-8
ENV TZ=Asia/Tokyo
ENV GENERATE_SOURCEMAP=false
