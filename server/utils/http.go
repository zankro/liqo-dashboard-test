package utils

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"k8s.io/apimachinery/pkg/util/json"
	"k8s.io/klog/v2"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// SetupRouterAndServeHTTP setups and starts the http server. If everything goes well, it never returns.
func SetupRouterAndServeHTTP(ctx context.Context, cl client.Client) error {
	addr := os.Getenv("SERVER_ADDR")
	fmt.Println("addr: ", addr)
	if addr == "" {
		klog.Fatal("Environment variable named SERVER_ADDR not set")
	}

	router := routes(ctx, cl)
	server := &http.Server{
		Addr:              addr,
		ReadHeaderTimeout: 5 * time.Second,
		Handler:           cors.Default().Handler(router),
	}
	return server.ListenAndServe()
}

func routes(ctx context.Context, cl client.Client) http.Handler {
	router := mux.NewRouter().StrictSlash(true)

	// Routes to serve
	router.HandleFunc("/api/foreign_clusters", foreignClusters(ctx, cl))

	return router
}

func foreignClusters(ctx context.Context, cl client.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clusters, err := getDetailedResources(ctx, cl)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			err := json.NewEncoder(w).Encode(ErrorResponse{
				Message: "An error occurred during retrieving of foreign clusters and metrics",
				Status:  http.StatusInternalServerError,
			})
			if err != nil {
				klog.Errorf("Error encoding error response: %s", err)
			}
		}

		err = json.NewEncoder(w).Encode(clusters)
		if err != nil {
			klog.Errorf("Error encoding foreign clusters response: %s", err)
		}
	}
}
