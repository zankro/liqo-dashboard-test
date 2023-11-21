// Codice che luca ha suggerito su 2 piedi per creare un programmino in Go che comunichi con l'API K8s
// C'è da sistemarlo ma nel frattempo sto andando per gradi seguendo una guida che ho trovato
// Per questo per ora sto file l'ho rinominato .old e sto provando altri programmini
// Guida: https://iximiuz.com/en/series/working-with-kubernetes-api/

package main

import (
	"context"
	"flag"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"

	"k8s.io/klog"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func main() {
	klog.InitFlags(nil)
	flag.Parse()
	ctx := context.Background()

	config := ctrl.GetConfigOrDie()

	cl, err := client.New(config, client.Options{})
	if err != nil {
		klog.Fatalf("error creating manager: %", err)
	}

	deploymentList := &appsv1.DeploymentList{}
	err = cl.List(ctx, deploymentList)
	if err != nil {
		klog.Warningf("error retrieving pod metrics: %s", err)
		return
	}
	for i := deploymentList.Items {

		fmt.Printf("%#v\n\n\n", i)

	}
}
