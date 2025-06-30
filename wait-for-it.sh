#!/usr/bin/env bash

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Esperando a que $host:$port esté disponible..."

until nc -z "$host" "$port"; do
  echo "Esperando a $host:$port..."
  sleep 1
done

echo "$host:$port está disponible. Ejecutando el comando: $cmd"
exec $cmd