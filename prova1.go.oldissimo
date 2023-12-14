package main

import (
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/klog"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func main() {
	config := client.New(config, client.Options{
		Scheme: scheme,
	})
	if err != nil {
		klog.Fatalf("error creating manager: %", err)
	}

	deployment := &appsv1.Deployment{
		Spec: appsv1.DeploymentSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Name: "web", Image: "nginx:1.21"},
					},
				},
			},
		},
	}

	deployment1 := &appsv1.DeploymentList{}

	err = cl.List(ctx, deployment1)
	if err != nil {
		klog.Warningf("error retrieving pod metrics: %s", err)
		return nil, err
	}
	// out, err := json.MarshalIndent(&deployment, "", "  ")
	// if err != nil {
	// 	log.Println(err)
	// 	os.Exit(1)
	// }

	fmt.Printf("%#v\n\n\n", deployment)
	fmt.Printf("%#v", deployment1)
}
