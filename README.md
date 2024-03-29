# Runnare il client

## Prerequisiti:
`Nodejs e npm`
Avere un cluster up con liqo installato. 
Avere il metrics server installato sul cluster Kubernetes.

## Per runnare il client
`cd client`
`npm install`
`npm start`
Questo avvierà il client in modalità di sviluppo e aprirà una nuova finestra del browser che punta a `http://localhost:3000`.

## Per runnare il server

Bisogna creare la variabile KUBECONFIG con il config del proprio cluster `export KUBECONFIG=`
`cd server`
`export SERVER_ADDR=:8089`
`go run cmd/server/main.go`
Questo avvierà il server all'indirizzo `http://localhost:8089`.
