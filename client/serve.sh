#!/bin/bash
set -m

rm -rf ./env-config.js
touch ./env-config.js

echo "window._env_ = {" >> ./env-config.js

# List of environment variables to read
vars=("REACT_APP_BACKEND_ADDRESS" "REACT_APP_BACKEND_PORT")

for varname in "${vars[@]}"
do
  value=$(printf '%s\n' "${!varname}")
  
  if [[ -z $value ]]; then
    echo "Environment variable $varname is not set"
    exit 1
  fi
  
  echo "  $varname: \"$value\"," >> ./env-config.js
done

echo "}" >> ./env-config.js

exec nginx -g 'daemon off;'