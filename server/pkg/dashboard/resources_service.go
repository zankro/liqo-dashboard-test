package dashboard

import (
	"context"
	"fmt"

	//net "github.com/liqotech/liqo/apis/net/v1alpha1"
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
	resourceOffer, err := liqogetters.GetResourceOfferByLabel(ctx, cl, metav1.NamespaceAll, liqolabels.RemoteLabelSelector())
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
	//Questa è da ottimizzare perchè non è efficiente dato che devo fare una ricerca per valore nella mappa [podName]nodeName
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

	// si chiama localPodList ma in realta' prende tutti i pods, anche quelli offloaded. Mappa podName -> nodeName
	localPodList := &corev1.PodList{}
	err = cl.List(ctx, localPodList)
	if err != nil {
		klog.Errorf("error retrieving local pods: %s", err)
		return nil, err
	}

	// Qua creo effettivamente la mappa podName --> nodeName
	//map[podName]nodeName
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

	for _, pod := range podMetricsList.Items {
		var podCpuUsage, podMemoryUsage float64
		containerResources := []ContainerResourceMetrics{}

		// Aggrego risorse usate per ogni container del pod
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

		// Se il pod è offloaded, aggrego e aggiungo le risorse usate al nodo remoto
		if remoteNodeNamePod[pod.Name] != "" && pod.ObjectMeta.Labels["liqo.io/shadowPod"] != "" {
			var remoteNode NodeResourceMetrics
			if _, exists := virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]]; exists {
				remoteNode = virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]]
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
			//credo la * si possa cancellare (anche dal models)
			*remoteNode.Pods = append(*remoteNode.Pods, PodResourceMetrics{
				Name:                pod.Name,
				ContainersResources: &containerResources,
				TotalMemory:         podMemoryUsage,
				TotalCpus:           podCpuUsage,
			})

			virtualNodeResourceMetrics[remoteNodeNamePod[pod.Name]] = remoteNode

		} else if localNodeNamePod[pod.Name] != "" && namespaceMap[pod.Namespace] {

			// Se il pod è locale, aggrego e aggiungo le risorse usate al nodo locale
			var localNode NodeResourceMetrics
			if _, exists := localNodeResourceMetrics[remoteNodeNamePod[pod.Name]]; exists {
				localNode = localNodeResourceMetrics[remoteNodeNamePod[pod.Name]]
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

			localNodeResourceMetrics[localNodeNamePod[pod.Name]] = localNode
		}
	}

	var ClusterDtoArray []ClusterDto

	// Per ogni foreign cluster creo un ClusterDto e controllo se è in peering Outgoing.
	// In tal caso aggiungo le risorse outgoing calcolate precedentemente
	for i := range foreignClusterList.Items {
		clusterDto := fromForeignCluster(&foreignClusterList.Items[i])
		if isPeeringEstablished(clusterDto.OutgoingPeering) {
			klog.V(5).Infof("Calculating outgoing resources for cluster %s", clusterDto.clusterID)
			outgoingResources := virtualNodeResourceMetrics[remoteNodeList[clusterDto.clusterID]]
			fmt.Println("Outgoing resources: ", outgoingResources, "i", i)
			*clusterDto.OutgoingResources = append(*clusterDto.OutgoingResources, outgoingResources)
			fmt.Println("Outgoing resources: ", clusterDto.OutgoingResources)
			clusterDto.IncomingResources = nil
			clusterDto.TotalUsedCpusRecived = outgoingResources.TotalCpus
			clusterDto.TotalUsedMemoryRecived = outgoingResources.TotalMemory
			clusterDto.LocalResources = nil
		}
		ClusterDtoArray = append(ClusterDtoArray, *clusterDto)
		fmt.Println("Outgoing resources: ", clusterDto.OutgoingResources, clusterDto.Name)

	}

	incomingClusterResources := make(map[string][]PodResourceMetrics)

	incomingPodResources := make(map[string]PodResourceMetrics)

	incomingPodMetricsList := []metricsv1beta1.PodMetricsList{}

	// Per ogni foreign cluster recupero le metriche dei pods con label virtualkubelet.liqo.io/origin=clusterID e le aggiungo alla lista incomingPodMetricsList
	// clusterID è l'ID del foreign cluster
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

	// Per ogni pod della lista incomingPodMetricsList calcolo le risorse usate e le aggiungo alla lista incomingPodResources
	for _, pod := range incomingPodMetricsList {
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

			// Aggrego le risorse usate per ogni pod con stesso clusterID di origine
			var incomingPod PodResourceMetrics
			if _, exists := incomingPodResources[incomingPod.Name]; exists {
				incomingPod = incomingPodResources[podMetrics.Name]
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
			incomingPodResources[incomingPod.Name] = incomingPod
			if incomingClusterResources[podMetrics.Labels["virtualkubelet.liqo.io/origin"]] == nil {
				incomingClusterResources[podMetrics.Labels["virtualkubelet.liqo.io/origin"]] = []PodResourceMetrics{}
			}

			incomingClusterResources[podMetrics.Labels["virtualkubelet.liqo.io/origin"]] = append(incomingClusterResources[podMetrics.Labels["virtualkubelet.liqo.io/origin"]], incomingPod)
		}
	}

	for i := range ClusterDtoArray {
		ClusterDtoArray[i].IncomingResources = &[]PodResourceMetrics{}
		*ClusterDtoArray[i].IncomingResources = append(*ClusterDtoArray[i].IncomingResources, incomingClusterResources[ClusterDtoArray[i].clusterID]...)
		for _, pod := range incomingClusterResources[ClusterDtoArray[i].clusterID] {
			ClusterDtoArray[i].TotalUsedCpusOffered += pod.TotalCpus
			ClusterDtoArray[i].TotalUsedMemoryOffered += pod.TotalMemory
		}
	}

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

	// Per ogni foreign cluster calcolo le risorse totali ricevute e offerte
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
			ClusterDtoArray[i].TotalCpusRecived = clusterNode.Items[0].Status.Capacity.Cpu().AsApproximateFloat64()
			ClusterDtoArray[i].TotalMemoryRecived = clusterNode.Items[0].Status.Capacity.Memory().AsApproximateFloat64()
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
			localCluster.TotalUsedCpusRecived += clusterDto.TotalUsedCpusRecived
			localCluster.TotalUsedMemoryRecived += clusterDto.TotalUsedMemoryRecived
			localCluster.TotalCpusRecived += clusterDto.TotalCpusRecived
			localCluster.TotalMemoryRecived += clusterDto.TotalMemoryRecived
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

	ClustersInfo["local"] = []ClusterDto{localCluster}
	ClustersInfo["remote"] = ClusterDtoArray
	return ClustersInfo, nil
}
