package main

import (
	"context"
	"flag"

	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/klog/v2"

	"dashboard_backend/utils"
)

func main() {
	klog.InitFlags(nil)
	flag.Parse()
	ctx := context.Background()

	cl, err := utils.GetKClient(ctx)
	utilruntime.Must(err)

	klog.Fatalf("unable to start the server: %s", utils.SetupRouterAndServeHTTP(ctx, cl))
}
