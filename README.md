# Discos: aplicación Node.js + MongoDB con Docker
Aplicación web (Express + Nunjucks) que hace un CRUD de discos sobre MongoDB.
Las imágenes están publicadas en GitHub Container Registry:
- `ghcr.io/axelthefox/discos-app:1.0`: la aplicación
- `ghcr.io/axelthefox/discos-mongo:1.0`: MongoDB 7.0 con los datos iniciales

## Requisitos

Solo Docker (con Docker Compose). No hace falta instalar Node.js ni MongoDB.

## Puesta en marcha
```bash
git clone https://github.com/axelthefox/discos-docker.git
cd discos-docker
cp .env.example .env        # y edita .env para poner tu propia contraseña
docker compose pull         # descarga las imágenes desde ghcr.io
docker compose up -d        # arranca MongoDB y la aplicación
```

## Parar
```bash
docker compose down         # para y borra los contenedores (los datos se conservan)
docker compose down -v      # además BORRA los datos (vuelven los iniciales)
```