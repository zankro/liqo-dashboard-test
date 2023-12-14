package main

import (
	"context"
	"encoding/json"
	"flag"
	"os"

	discoveryv1alpha1 "github.com/liqotech/liqo/apis/discovery/v1alpha1"
	sharingv1alpha1 "github.com/liqotech/liqo/apis/sharing/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/klog"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var (
	scheme      = runtime.NewScheme()
	c           client.Client
	someIndexer client.FieldIndexer
)

func init() {
	_ = discoveryv1alpha1.AddToScheme(scheme)
	_ = sharingv1alpha1.AddToScheme(scheme)
	_ = corev1.AddToScheme(scheme)
}

func main() {
	klog.InitFlags(nil)
	flag.Parse()
	ctx := context.Background()

	config := ctrl.GetConfigOrDie()

	cl, err := client.New(config, client.Options{
		Scheme: scheme,
	})
	if err != nil {
		klog.Fatalf("error creating manager: %s", err)
		return
	}

	podMetricsList := cl.List(ctx, &corev1.PodList{})
	if err != nil {
		klog.Errorf("%s", err)
		return
	}

	file, err := os.Create("output.txt")
	if err != nil {
		klog.Fatalf("error creating file: %s", err)
		return
	}
	defer file.Close()

	// Convert the first pod to JSON
	podJson, err := json.MarshalIndent(podMetricsList, "", "  ")
	if err != nil {
		klog.Fatalf("error converting pod to JSON: %s", err)
		return
	}

	// Write the JSON to the file
	_, err = file.Write(podJson)
	if err != nil {
		klog.Fatalf("error writing to file: %s", err)
		return
	}
}
func ExampleFieldIndexer_secretNameNode() {
	// someIndexer is a FieldIndexer over a Cache
	_ = someIndexer.IndexField(context.TODO(), &corev1.Pod{}, "spec.volumes.secret.secretName", func(o client.Object) []string {
		var res []string
		for _, vol := range o.(*corev1.Pod).Spec.Volumes {
			if vol.Secret == nil {
				continue
			}
			// just return the raw field value -- the indexer will take care of dealing with namespaces for us
			res = append(res, vol.Secret.SecretName)
		}
		return res
	})

	_ = someIndexer.IndexField(context.TODO(), &corev1.Pod{}, "spec.NodeName", func(o client.Object) []string {
		nodeName := o.(*corev1.Pod).Spec.NodeName
		if nodeName != "" {
			return []string{nodeName}
		}
		return nil
	})

	// elsewhere (e.g. in your reconciler)
	mySecretName := "someSecret" // derived from the reconcile.Request, for instance
	myNode := "master-0"
	var podsWithSecrets corev1.PodList
	_ = c.List(context.Background(), &podsWithSecrets, client.MatchingFields{
		"spec.volumes.secret.secretName": mySecretName,
		"spec.NodeName":                  myNode,
	})
}
