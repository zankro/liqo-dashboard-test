package dashboard

import (
	"context"
	"fmt"

	discoveryv1alpha1 "github.com/liqotech/liqo/apis/discovery/v1alpha1"
	sharingv1alpha1 "github.com/liqotech/liqo/apis/sharing/v1alpha1"
	liqoconsts "github.com/liqotech/liqo/pkg/consts"
	liqogetters "github.com/liqotech/liqo/pkg/utils/getters"
	liqolabels "github.com/liqotech/liqo/pkg/utils/labels"
	liqorestcfg "github.com/liqotech/liqo/pkg/utils/restcfg"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/klog/v2"
	metricsv1beta1 "k8s.io/metrics/pkg/apis/metrics/v1beta1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var (
	scheme = runtime.NewScheme()
)

func init() {
	_ = discoveryv1alpha1.AddToScheme(scheme)
	_ = sharingv1alpha1.AddToScheme(scheme)
	_ = metricsv1beta1.AddToScheme(scheme)
	_ = corev1.AddToScheme(scheme)
}

// GetKClient creates a kubernetes API client and returns it.
func GetKClient(ctx context.Context) (client.Client, error) {
	config := liqorestcfg.SetRateLimiter(ctrl.GetConfigOrDie())

	cl, err := client.New(config, client.Options{
		Scheme: scheme,
	})
	if err != nil {
		klog.Fatalf("error creating manager: %", err)
	}

	return cl, nil
}

// It gets all the available foreign clusters connected to the local cluster and calculate
// incoming and outgoing resources.
//func getForeignClusters(ctx context.Context, cl client.Client) (*[]ClusterDto, error) {
//	foreignClusterList := &discoveryv1alpha1.ForeignClusterList{}
//	err := cl.List(ctx, foreignClusterList)
//	if err != nil {
//		klog.Errorf("error retrieving foreign clusters: %s", err)
//		return nil, err
//	}
//
//	podMetricsList := &metricsv1beta1.PodMetricsList{}
//	err = cl.List(ctx, podMetricsList, client.MatchingLabels{
//		liqoconsts.LocalPodLabelKey: "true",
//	})
//	if err != nil {
//		klog.Warningf("error retrieving pod metrics: %s", err)
//		return nil, err
//	}
//	podMetricsMap := podMetricListToMap(podMetricsList.Items)
//
//	var clusters []ClusterDto
//	for i := range foreignClusterList.Items {
//		clusterDto := fromForeignCluster(&foreignClusterList.Items[i])
//
//		if isPeeringEstablished(clusterDto.OutgoingPeering) {
//			klog.V(5).Infof("Calculating outgoing resources for cluster %s", clusterDto.clusterID)
//			outgoingResources, err := calculateOutgoingResources(ctx, cl, clusterDto.clusterID, podMetricsMap)
//			if err == nil {
//				clusterDto.OutgoingResources = outgoingResources
//			} // otherwise, the outgoing resources are not calculated so they are nil
//		}
//
//		if isPeeringEstablished(clusterDto.IncomingPeering) {
//			incomingResources, err := calculateIncomingResources(ctx, cl, clusterDto.clusterID)
//			if err == nil {
//				clusterDto.IncomingResources = incomingResources
//			} // otherwise, the incoming resources are not calculated so they are nil
//		}
//
//		// in this moment clusters without any resource are also added to the list but we can decide to filter them
//		clusters = append(clusters, *clusterDto)
//	}
//
//	return &clusters, nil
//}

// CalculateOutgoingResources The outgoing˙ resources aren't calculated, but they are simply retrieved from the metrics of the virtual node. The
// clusterID identifies the virtual node by the label liqo.io/remote-cluster-id=clusterID.
func calculateOutgoingResources(ctx context.Context, cl client.Client, clusterID string,
	shadowPodsMetrics map[string]*metricsv1beta1.PodMetrics) (*ContainerResourceMetrics, error) {
	resourceOffer, err := liqogetters.GetResourceOfferByLabel(ctx, cl, metav1.NamespaceAll, liqolabels.RemoteLabelSelector(clusterID))
	if err != nil {
		klog.V(5).Infof("error retrieving resourceOffers: %s", err)
		return nil, err
	}

	podList, err := getOutgoingPods(ctx, cl, clusterID)
	if err != nil {
		klog.Errorf("error retrieving outgoing pods: %s", err)
		return nil, err
	}

	currentPodMetrics := []metricsv1beta1.PodMetrics{}
	for i := range podList {
		singlePodMetrics, found := shadowPodsMetrics[podList[i].Name]
		if found {
			currentPodMetrics = append(currentPodMetrics, *singlePodMetrics)
		}
	}

	cpuUsage, memUsage := aggregatePodsMetrics(currentPodMetrics)
	totalResources := resourceOffer.Spec.ResourceQuota.Hard
	return newResourceMetrics(cpuUsage, memUsage, totalResources), nil
}

// Calculates the resources that the local cluster is giving to a remote cluster identified by a given clusterID.
// In order to calculate these resources the function sums the resources consumed by all pods having the label
// virtualkubelet.liqo.io/origin=clusterID which is present only on pods that have been scheduled from the
// remote cluster.
//
//	func calculateIncomingResources(ctx context.Context, cl client.Client, clusterID string) (*PodResourceMetrics, error) {
//		resourceOffer, err := liqogetters.GetResourceOfferByLabel(ctx, cl, metav1.NamespaceAll, liqolabels.LocalLabelSelector(clusterID))
//		if err != nil {
//			klog.Warningf("error retrieving resourceOffers: %s", err)
//			return nil, err
//		}
//
//		podMetricsList := &metricsv1beta1.PodMetricsList{}
//		if err := cl.List(ctx, podMetricsList, client.MatchingLabels{
//			virtualkubeletconsts.LiqoOriginClusterIDKey: clusterID,
//		}); err != nil {
//			return nil, err
//		}
//
//		cpuUsage, memUsage := aggregatePodsMetrics(podMetricsList.Items)
//
//		totalResources := resourceOffer.Spec.ResourceQuota.Hard
//		return newResourceMetrics(cpuUsage, memUsage, totalResources), nil
//	}
func getLocalPods(ctx context.Context, cl client.Client) (*corev1.PodList, error) {
	podList := &corev1.PodList{}
	err := cl.List(ctx, podList)
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return nil, err
	}
	podsWithoutLabel := &corev1.PodList{}
	for _, pod := range podList.Items {
		if _, ok := pod.Labels[liqoconsts.LocalPodLabelKey]; !ok {
			podsWithoutLabel.Items = append(podsWithoutLabel.Items, pod)
		}
	}

	return podsWithoutLabel, nil
}

func getOutgoingPods(ctx context.Context, cl client.Client, clusterID string) ([]corev1.Pod, error) {
	nodeList := &corev1.NodeList{}
	if err := cl.List(ctx, nodeList, client.MatchingLabels{
		liqoconsts.RemoteClusterID: clusterID,
	}); err != nil {
		klog.V(5).Infof("error retrieving nodes: %s", err)
		return nil, err
	}

	if len(nodeList.Items) != 1 {
		return nil, fmt.Errorf("expected exactly one element in the list of Nodes but got %d", len(nodeList.Items))
	}

	node := nodeList.Items[0].Name
	podList := &corev1.PodList{}
	err := cl.List(ctx, podList, client.MatchingFields{
		"spec.nodeName": node,
	})
	if err != nil {
		klog.V(5).Infof("error retrieving pods: %w", err)
		return nil, fmt.Errorf("error retrieving pods: %w", err)
	}

	return podList.Items, nil
}

func getDetailedResources(ctx context.Context, cl client.Client) ([]ClusterDto, error) {

	foreignClusterList := &discoveryv1alpha1.ForeignClusterList{}
	err := cl.List(ctx, foreignClusterList)
	if err != nil {
		klog.Errorf("error retrieving foreign clusters: %s", err)
		return nil, err
	}

	remotePodList := &corev1.PodList{}

	err = cl.List(ctx, remotePodList, client.MatchingLabels{
		liqoconsts.LocalPodLabelKey: "true",
	})
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return nil, err
	}

	remoteNodeNamePod := make(map[string]string)
	for _, pod := range remotePodList.Items {
		remoteNodeNamePod[pod.Name] = pod.Spec.NodeName
	}

	remoteNodeList := make(map[string]string)
	localNodeList := []string{}

	nodeList := &corev1.NodeList{}
	err = cl.List(ctx, nodeList)

	if err != nil {
		klog.Errorf("error retrieving nodes: %s", err)
		return nil, err
	}

	for _, node := range nodeList.Items {
		for _, nodeName := range remoteNodeNamePod {
			if node.Name == nodeName {
				remoteNodeList[node.Labels["liqo.io/remote-cluster-id"]] = node.Name
				fmt.Println(remoteNodeList, "Questi sono i remoteNodeList\n\n\n\n\n\n\n\n")
			} else {
				localNodeList = append(localNodeList, node.Name)
			}
		}
	}
	localPodList := &corev1.PodList{}

	err = cl.List(ctx, remotePodList, client.MatchingLabels{
		liqoconsts.LocalPodLabelKey: "false",
	})
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return nil, err
	}

	localNodeNamePod := make(map[string]string)
	for _, pod := range localPodList.Items {
		localNodeNamePod[pod.Name] = pod.Spec.NodeName
	}

	fmt.Println(localNodeNamePod, "Questi sono i local NodeNamePod\n\n\n\n\n\n\n\n")

	podMetricsList := &metricsv1beta1.PodMetricsList{}
	err = cl.List(ctx, podMetricsList)
	if err != nil {
		klog.Warningf("error retrieving pod metrics: %s", err)
		return nil, err
	}

	virtualNodeResourceMetrics := make(map[string]NodeResourceMetrics)
	localNodeResourceMetrics := make(map[string]NodeResourceMetrics)

	for _, pod := range podMetricsList.Items {
		var podCpuUsage, podMemoryUsage float64
		var containerResources []ContainerResourceMetrics
		for _, cont := range pod.Containers {
			cpuUsage := cont.Usage.Cpu().AsApproximateFloat64()
			memoryUsage := cont.Usage.Memory().AsApproximateFloat64()
			podCpuUsage += cpuUsage
			podMemoryUsage += memoryUsage
			containerResources = append(containerResources, ContainerResourceMetrics{
				Name:        cont.Name,
				TotalCpus:   cpuUsage,
				TotalMemory: memoryUsage,
			})
		}
		if remoteNodeNamePod[pod.Name] != "" {
			var remoteNode NodeResourceMetrics
			if _, exists := virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]]; !exists {
				remoteNode = NodeResourceMetrics{}
			} else {
				remoteNode = virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]]
			}
			remoteNode.Name = remoteNodeNamePod[pod.Name]
			remoteNode.TotalCpus += podCpuUsage
			remoteNode.TotalMemory += podMemoryUsage
			if remoteNode.Pods == nil {
				remoteNode.Pods = &[]PodResourceMetrics{}
				fmt.Println(pod.Name, "Questo è il pod name\n\n\n\n\n\n\n\n")
			}
			*remoteNode.Pods = append(*remoteNode.Pods, PodResourceMetrics{
				Name:                pod.Name,
				ContainersResources: &containerResources,
				TotalMemory:         podMemoryUsage,
				TotalCpus:           podCpuUsage,
			})

			virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]] = remoteNode
		}
		if localNodeNamePod[pod.Name] != "" {
			var localNode NodeResourceMetrics
			if _, exists := virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]]; !exists {
				localNode = NodeResourceMetrics{}
			} else {
				localNode = virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]]
			}
			localNode.Name = remoteNodeNamePod[pod.Name]
			localNode.TotalCpus += podCpuUsage
			localNode.TotalMemory += podMemoryUsage
			if localNode.Pods == nil {
				localNode.Pods = &[]PodResourceMetrics{}
			}
			*localNode.Pods = append(*localNode.Pods, PodResourceMetrics{
				Name:                pod.Name,
				ContainersResources: &containerResources,
				TotalMemory:         podMemoryUsage,
				TotalCpus:           podCpuUsage,
			})
			localNodeResourceMetrics[localNodeNamePod[pod.Name]] = localNode
		}
	}

	var ClusterDto []ClusterDto

	for i := range foreignClusterList.Items {
		clusterDto := fromForeignCluster(&foreignClusterList.Items[i])
		if isPeeringEstablished(clusterDto.OutgoingPeering) {
			klog.V(5).Infof("Calculating outgoing resources for cluster %s", clusterDto.clusterID)
			outgoingResources := virtualNodeResourceMetrics[remoteNodeList[clusterDto.clusterID]]
			clusterDto.OutgoingResources = &outgoingResources
			clusterDto.TotalCpus = outgoingResources.TotalCpus
			clusterDto.TotalMemory = outgoingResources.TotalMemory
		}

		ClusterDto = append(ClusterDto, *clusterDto)
	}
	return ClusterDto, nil
}
