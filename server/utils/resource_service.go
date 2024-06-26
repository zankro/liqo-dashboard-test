package utils

import (
	"context"
	"fmt"

	net "github.com/liqotech/liqo/apis/net/v1alpha1"

	discoveryv1alpha1 "github.com/liqotech/liqo/apis/discovery/v1alpha1"
	sharingv1alpha1 "github.com/liqotech/liqo/apis/sharing/v1alpha1"
	liqoconsts "github.com/liqotech/liqo/pkg/consts"
	liqoutils "github.com/liqotech/liqo/pkg/utils"
	liqogetters "github.com/liqotech/liqo/pkg/utils/getters"
	liqolabels "github.com/liqotech/liqo/pkg/utils/labels"
	liqorestcfg "github.com/liqotech/liqo/pkg/utils/restcfg"
	virtualkubeletconsts "github.com/liqotech/liqo/pkg/virtualKubelet/forge"
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
	_ = net.AddToScheme(scheme)
}

// GetKClient creates a kubernetes API client and returns it.
func GetKClient(ctx context.Context) (client.Client, error) {
	config := liqorestcfg.SetRateLimiter(ctrl.GetConfigOrDie())

	cl, err := client.New(config, client.Options{
		Scheme: scheme,
	})
	if err != nil {
		klog.Fatalf("error creating manager: %s", err)
	}

	return cl, nil
}

func getDetailedResources(ctx context.Context, cl client.Client) (map[string][]ClusterDto, error) {

	foreignClusterList := &discoveryv1alpha1.ForeignClusterList{}
	err := cl.List(ctx, foreignClusterList)
	if err != nil {
		klog.Errorf("error retrieving foreign clusters: %s", err)
		return nil, err
	}

	// Retrieve from Local Clusters pod list of pods with ShadowPod label, i.e. list of pods offloaded to remote clusters
	remotePodList := &corev1.PodList{}
	err = cl.List(ctx, remotePodList, client.MatchingLabels{
		liqoconsts.LocalPodLabelKey: "true",
	})
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return nil, err
	}

	// Populates remoteNodeNamePod with the name of the node where the pod is running and namespaceMap with the namespaces of the pods
	//map[podName]nodeName
	remoteNodeNamePod := make(map[string]string)
	namespaceMap := make(map[string]bool)
	for _, pod := range remotePodList.Items {
		remoteNodeNamePod[pod.Name] = pod.Spec.NodeName
		if _, exists := namespaceMap[pod.Namespace]; !exists {
			namespaceMap[pod.Namespace] = true
		}
	}

	//map[clusterID]nodeName
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
				break
			}
		}
		if node.Labels["liqo.io/remote-cluster-id"] == "" {
			localNodeList = append(localNodeList, node.Name)
		}
	}

	fmt.Println("Local Nodes: ", localNodeList)
	fmt.Println("Remote Nodes: ", remoteNodeList)

	// retrieve pods from local cluster
	localPodList := &corev1.PodList{}
	err = cl.List(ctx, localPodList)
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return nil, err
	}

	// maps podName to nodeName of the node where the pod is running
	// map[podName]nodeName
	localNodeNamePod := make(map[string]string)
	for _, pod := range localPodList.Items {
		localNodeNamePod[pod.Name] = pod.Spec.NodeName
	}

	podMetricsList := &metricsv1beta1.PodMetricsList{}
	err = cl.List(ctx, podMetricsList)
	if err != nil {
		klog.Warningf("error retrieving pod metrics: %s", err)
		return nil, err
	}

	virtualNodeResourceMetrics := make(map[string]NodeResourceMetrics)
	localNodeResourceMetrics := make(map[string]NodeResourceMetrics)

	offloadingAggregates(podMetricsList, &localNodeResourceMetrics, &virtualNodeResourceMetrics, remoteNodeNamePod, localNodeNamePod, namespaceMap)

	var ClusterDtoArray []ClusterDto

	createOffloadingDTO(&ClusterDtoArray, &localNodeResourceMetrics, &virtualNodeResourceMetrics, foreignClusterList, remoteNodeList)

	incomingClusterResources := make(map[string][]PodResourceMetrics)

	incomingPodResources := make(map[string]PodResourceMetrics)

	incomingPodMetricsList := []metricsv1beta1.PodMetricsList{}

	// For each foreign cluster, retrieve the metrics of the pods with label virtualkubelet.liqo.io/origin=clusterID and add them to the incomingPodMetricsList list
	// clusterID is the ID of the foreign cluster
	for _, actualCluster := range ClusterDtoArray {
		podMetricsList := &metricsv1beta1.PodMetricsList{}
		clusterID := actualCluster.clusterID
		if err := cl.List(ctx, podMetricsList, client.MatchingLabels{
			virtualkubeletconsts.LiqoOriginClusterIDKey: clusterID,
		}); err != nil {
			return nil, err
		}
		incomingPodMetricsList = append(incomingPodMetricsList, *podMetricsList)
	}

	incomingAggregates(&ClusterDtoArray, &incomingPodMetricsList, &incomingPodResources, &incomingClusterResources)

	// Retrieve the latency for each foreign cluster and add it to the ClusterDto
	latency := &net.TunnelEndpointList{}

	if err := cl.List(ctx, latency); err != nil {
		return nil, err
	}
	for i := range ClusterDtoArray {
		for _, tunnel := range latency.Items {
			if ClusterDtoArray[i].clusterID == tunnel.Labels["clusterID"] {
				ClusterDtoArray[i].Latency.Value = tunnel.Status.Connection.Latency.Value
				ClusterDtoArray[i].Latency.Timestamp = tunnel.Status.Connection.Latency.Timestamp
			}
		}
	}

	// For each foreign cluster calculate the total resources received and offered
	for i := range ClusterDtoArray {
		if isPeeringEstablished(ClusterDtoArray[i].OutgoingPeering) {
			clusterNode := &corev1.NodeList{}
			if err := cl.List(ctx, clusterNode, client.MatchingLabels{
				"liqo.io/remote-cluster-id": ClusterDtoArray[i].clusterID,
			}); err != nil {
				return nil, err
			}
			if len(clusterNode.Items) != 1 {
				return nil, fmt.Errorf("expected exactly one element in the list of Nodes but got %d", len(clusterNode.Items))
			}
			ClusterDtoArray[i].TotalCpusReceived = clusterNode.Items[0].Status.Capacity.Cpu().AsApproximateFloat64()
			ClusterDtoArray[i].TotalMemoryReceived = clusterNode.Items[0].Status.Capacity.Memory().AsApproximateFloat64()
		}
		if isPeeringEstablished(ClusterDtoArray[i].IncomingPeering) {
			resourceOffer, err := liqogetters.GetResourceOfferByLabel(ctx, cl, metav1.NamespaceAll, liqolabels.LocalLabelSelectorForCluster(ClusterDtoArray[i].clusterID))
			if err != nil {
				klog.Warningf("error retrieving resourceOffers: %s", err)
				return nil, err
			}
			ClusterDtoArray[i].TotalCpusOffered = resourceOffer.Spec.ResourceQuota.Hard.Cpu().AsApproximateFloat64()
			ClusterDtoArray[i].TotalMemoryOffered = resourceOffer.Spec.ResourceQuota.Hard.Memory().AsApproximateFloat64()
		}
	}

	var localCluster ClusterDto

	clusterIdentity, err := liqoutils.GetClusterIdentityWithControllerClient(ctx, cl, metav1.NamespaceAll)
	if err != nil {
		klog.Warningf("error retrieving local cluster identity: %s", err)
		return nil, err
	}
	localCluster.Name = clusterIdentity.ClusterName
	localCluster.clusterID = clusterIdentity.ClusterID

	for _, clusterDto := range ClusterDtoArray {
		if isPeeringEstablished(clusterDto.OutgoingPeering) {
			localCluster.OutgoingPeering = discoveryv1alpha1.PeeringConditionStatusEstablished
			localCluster.TotalUsedCpusReceived += clusterDto.TotalUsedCpusReceived
			localCluster.TotalUsedMemoryReceived += clusterDto.TotalUsedMemoryReceived
			localCluster.TotalCpusReceived += clusterDto.TotalCpusReceived
			localCluster.TotalMemoryReceived += clusterDto.TotalMemoryReceived
		}

		if isPeeringEstablished(clusterDto.IncomingPeering) {
			localCluster.IncomingPeering = discoveryv1alpha1.PeeringConditionStatusEstablished
			localCluster.TotalUsedCpusOffered += clusterDto.TotalUsedCpusOffered
			localCluster.TotalUsedMemoryOffered += clusterDto.TotalUsedMemoryOffered
			localCluster.TotalMemoryOffered += clusterDto.TotalMemoryOffered
			localCluster.TotalCpusOffered += clusterDto.TotalCpusOffered
		}
	}

	localNodeResources := []NodeResourceMetrics{}
	for i := range localNodeResourceMetrics {
		localNodeResources = append(localNodeResources, localNodeResourceMetrics[i])
	}
	localCluster.LocalResources = &localNodeResources

	ClustersInfo := make(map[string][]ClusterDto)

	localResourcesAggregates(ctx, cl, &localCluster)

	ClustersInfo["local"] = []ClusterDto{localCluster}
	ClustersInfo["remote"] = ClusterDtoArray

	return ClustersInfo, nil
}

func offloadingAggregates(podMetricsList *metricsv1beta1.PodMetricsList, localNodeResourceMetrics *map[string]NodeResourceMetrics, virtualNodeResourceMetrics *map[string]NodeResourceMetrics, remoteNodeNamePod map[string]string, localNodeNamePod map[string]string, namespaceMap map[string]bool) {

	for _, pod := range podMetricsList.Items {
		var podCpuUsage, podMemoryUsage float64
		containerResources := []ContainerResourceMetrics{}

		// Aggregate resources used for each container of the pod
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

		// If the pod is offloaded, aggregate and add the used resources to the remote node
		if remoteNodeNamePod[pod.Name] != "" && pod.ObjectMeta.Labels["liqo.io/shadowPod"] != "" {
			var remoteNode NodeResourceMetrics
			if _, exists := (*virtualNodeResourceMetrics)[remoteNodeNamePod[pod.Name]]; exists {
				remoteNode = (*virtualNodeResourceMetrics)[remoteNodeNamePod[pod.Name]]
			} else {
				remoteNode = NodeResourceMetrics{}
				remoteNode.Name = remoteNodeNamePod[pod.Name]
				remoteNode.TotalCpus = 0
				remoteNode.TotalMemory = 0
			}
			remoteNode.TotalCpus += podCpuUsage
			remoteNode.TotalMemory += podMemoryUsage

			if remoteNode.Pods == nil {
				remoteNode.Pods = &[]PodResourceMetrics{}
			}

			*remoteNode.Pods = append(*remoteNode.Pods, PodResourceMetrics{
				Name:                pod.Name,
				ContainersResources: &containerResources,
				TotalMemory:         podMemoryUsage,
				TotalCpus:           podCpuUsage,
			})

			(*virtualNodeResourceMetrics)[remoteNodeNamePod[pod.Name]] = remoteNode

		} else if localNodeNamePod[pod.Name] != "" && namespaceMap[pod.Namespace] {

			// If the pod is local, aggregate and add the used resources to the local node
			var localNode NodeResourceMetrics
			if _, exists := (*localNodeResourceMetrics)[remoteNodeNamePod[pod.Name]]; exists {
				localNode = (*localNodeResourceMetrics)[remoteNodeNamePod[pod.Name]]
			} else {
				localNode = NodeResourceMetrics{}
				localNode.Name = localNodeNamePod[pod.Name]
				localNode.TotalCpus = 0
				localNode.TotalMemory = 0
			}

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

			(*localNodeResourceMetrics)[localNodeNamePod[pod.Name]] = localNode
		}
	}

}

func createOffloadingDTO(ClusterDtoArray *[]ClusterDto, localNodeResourceMetrics *map[string]NodeResourceMetrics, virtualNodeResourceMetrics *map[string]NodeResourceMetrics, foreignClusterList *discoveryv1alpha1.ForeignClusterList, remoteNodeList map[string]string) {

	// For each foreign cluster I create a ClusterDto and check if it is in Outgoing peering.
	// In this case I add the outgoing resources calculated previously
	for i := range foreignClusterList.Items {
		clusterDto := fromForeignCluster(&foreignClusterList.Items[i])
		if isPeeringEstablished(clusterDto.OutgoingPeering) {
			klog.V(5).Infof("Calculating outgoing resources for cluster %s", clusterDto.clusterID)
			outgoingResources := (*virtualNodeResourceMetrics)[remoteNodeList[clusterDto.clusterID]]
			fmt.Println("Outgoing resources: ", outgoingResources, "i", i)
			*clusterDto.OutgoingResources = append(*clusterDto.OutgoingResources, outgoingResources)
			fmt.Println("Outgoing resources: ", clusterDto.OutgoingResources)
			clusterDto.IncomingResources = nil
			clusterDto.TotalUsedCpusReceived = outgoingResources.TotalCpus
			clusterDto.TotalUsedMemoryReceived = outgoingResources.TotalMemory
			clusterDto.LocalResources = nil
		}
		*ClusterDtoArray = append(*ClusterDtoArray, *clusterDto)
		fmt.Println("Outgoing resources: ", clusterDto.OutgoingResources, clusterDto.Name)

	}
}

func incomingAggregates(ptrArray *[]ClusterDto, incomingPodMetricsList *[]metricsv1beta1.PodMetricsList, incomingPodResources *map[string]PodResourceMetrics, incomingClusterResources *map[string][]PodResourceMetrics) {

	// For each pod in the incomingPodMetricsList list, calculate the used resources and add them to the incomingPodResources list
	for _, pod := range *incomingPodMetricsList {
		for _, podMetrics := range pod.Items {

			var podCpuUsage, podMemoryUsage float64
			containerResources := []ContainerResourceMetrics{}
			for _, cont := range podMetrics.Containers {
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

			// Aggregate resources used for each pod with the same clusterID of origin
			var incomingPod PodResourceMetrics
			if _, exists := (*incomingPodResources)[incomingPod.Name]; exists {
				incomingPod = (*incomingPodResources)[podMetrics.Name]
			} else {
				incomingPod = PodResourceMetrics{}
				incomingPod.Name = podMetrics.Name
				incomingPod.TotalCpus = 0
				incomingPod.TotalMemory = 0
			}

			incomingPod.TotalCpus += podCpuUsage
			incomingPod.TotalMemory += podMemoryUsage

			if incomingPod.ContainersResources == nil {
				incomingPod.ContainersResources = &[]ContainerResourceMetrics{}
			}
			*incomingPod.ContainersResources = append(*incomingPod.ContainersResources, ContainerResourceMetrics{
				Name:        podMetrics.Name,
				TotalMemory: podMemoryUsage,
				TotalCpus:   podCpuUsage,
			})
			(*incomingPodResources)[incomingPod.Name] = incomingPod
			if (*incomingClusterResources)[podMetrics.Labels["virtualkubelet.liqo.io/origin"]] == nil {
				(*incomingClusterResources)[podMetrics.Labels["virtualkubelet.liqo.io/origin"]] = []PodResourceMetrics{}
			}

			(*incomingClusterResources)[podMetrics.Labels["virtualkubelet.liqo.io/origin"]] = append((*incomingClusterResources)[podMetrics.Labels["virtualkubelet.liqo.io/origin"]], incomingPod)
		}
	}

	ClusterDtoArray := *ptrArray

	for i := range ClusterDtoArray {
		ClusterDtoArray[i].IncomingResources = &[]PodResourceMetrics{}
		*ClusterDtoArray[i].IncomingResources = append(*ClusterDtoArray[i].IncomingResources, (*incomingClusterResources)[ClusterDtoArray[i].clusterID]...)
		for _, pod := range (*incomingClusterResources)[ClusterDtoArray[i].clusterID] {
			ClusterDtoArray[i].TotalUsedCpusOffered += pod.TotalCpus
			ClusterDtoArray[i].TotalUsedMemoryOffered += pod.TotalMemory
		}
	}
}

func localResourcesAggregates(ctx context.Context, cl client.Client, clusterdata *ClusterDto) {

	clusterCPU := 0.0
	clusterMemory := 0.0
	clusterUsedCPU := 0.0
	clusterUsedMemory := 0.0

	localNodes := &corev1.NodeList{}

	err := cl.List(ctx, localNodes)
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return
	}

	fmt.Println(localNodes.Items)

	for _, node := range localNodes.Items {
		if _, exists := node.Labels["liqo.io/remote-cluster-id"]; !exists {
			clusterCPU += node.Status.Capacity.Cpu().AsApproximateFloat64()
			clusterMemory += node.Status.Capacity.Memory().AsApproximateFloat64()
		}
	}

	for _, localnode := range *clusterdata.LocalResources {
		clusterUsedCPU += localnode.TotalCpus
		clusterUsedMemory += localnode.TotalMemory
	}

	fmt.Println("Cluster CPU: ", clusterCPU)
	fmt.Println("Cluster Memory: ", clusterMemory)
	fmt.Println("Cluster Used CPU: ", clusterUsedCPU)
	fmt.Println("Cluster Used Memory: ", clusterUsedMemory)

	clusterdata.ClusterCPU = clusterCPU
	clusterdata.ClusterMemory = clusterMemory
	clusterdata.ClusterCpuUsage = clusterUsedCPU
	clusterdata.ClusterMemoryUsage = clusterUsedMemory

}
