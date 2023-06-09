# nécessaire pour travailler sur centraverse
# si la commande docker-compose existe, on remplace "docker compose" par docker-compose
if type "docker-compose" > /dev/null; then
  function docker() {
    if (( $# > 0 )) && [ $1 == "compose" ]; then
      command "docker-compose" ${@:2}
    else
      command docker $@
    fi
  }
fi
