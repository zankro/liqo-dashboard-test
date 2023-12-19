package dashboard

import (
	discoveryv1alpha1 "github.com/liqotech/liqo/apis/discovery/v1alpha1"
	net "github.com/liqotech/liqo/apis/net/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
)

// ClusterDto represents the data of a cluster which is returned to the client.
type ClusterDto struct {
	clusterID              string
	Name                   string                                       `json:"name"`
	Networking             discoveryv1alpha1.PeeringConditionStatusType `json:"networking"`
	Authentication         discoveryv1alpha1.PeeringConditionStatusType `json:"authentication"`
	OutgoingPeering        discoveryv1alpha1.PeeringConditionStatusType `json:"outgoingPeering"`
	OutgoingResources      *NodeResourceMetrics                         `json:"outgoingResources"`
	IncomingPeering        discoveryv1alpha1.PeeringConditionStatusType `json:"incomingPeering"`
	IncomingResources      *[]PodResourceMetrics                        `json:"incomingResources"`
	Age                    string                                       `json:"age,omitempty"`
	TotalUsedCpusOffered   float64                                      `json:"TotalUsedCpusOffered"`
	TotalUsedMemoryOffered float64                                      `json:"TotalUsedMemoryOffered"`
	TotalUsedMemoryRecived float64                                      `json:"TotalUsedMemoryRecived"`
	TotalUsedCpusRecived   float64                                      `json:"TotalUsedCpusRecived"`
	TotalMemoryRecived     float64                                      `json:"TotalMemoryRecived"`
	TotalCpusRecived       float64                                      `json:"TotalCpusRecived"`
	Latency                net.ConnectionLatency                        `json:"Latency"`
	LocalResources         *[]NodeResourceMetrics                       `json:"localResources"`
}

// NamespaceResourceMetrics represents the metrics of a node
type NodeResourceMetrics struct {
	Name        string  `json:"name"`
	TotalCpus   float64 `json:"NodetotalCpus"`
	TotalMemory float64 `json:"NodetotalMemory"`
	Pods        *[]PodResourceMetrics
}

// ResourceMetrics represents the metrics of a cluster which is returned to the client.
type PodResourceMetrics struct {
	Name                string                      `json:"name"`
	ContainersResources *[]ContainerResourceMetrics `json:"containersResources"`
	TotalMemory         float64                     `json:"PodtotalMemory"`
	TotalCpus           float64                     `json:"PodtotalCpus"`
}

type ContainerResourceMetrics struct {
	Name        string  `json:"name"`
	TotalMemory float64 `json:"ContainertotalMemory"`
	TotalCpus   float64 `json:"ContainertotalCpus"`
}

// ErrorResponse is returned to the client in case of error.
type ErrorResponse struct {
	Message string `json:"message"`
	Status  int16  `json:"status"`
}

func fromForeignCluster(fc *discoveryv1alpha1.ForeignCluster) *ClusterDto {
	pc := peeringConditionsToMap(fc.Status.PeeringConditions)

	clusterDto := &ClusterDto{
		Name:            fc.Name,
		clusterID:       fc.Spec.ClusterIdentity.ClusterID,
		OutgoingPeering: statusOrDefault(pc, discoveryv1alpha1.OutgoingPeeringCondition),
		IncomingPeering: statusOrDefault(pc, discoveryv1alpha1.IncomingPeeringCondition),
		Networking:      statusOrDefault(pc, discoveryv1alpha1.NetworkStatusCondition),
		Authentication:  statusOrDefault(pc, discoveryv1alpha1.AuthenticationStatusCondition),
	}

	auth, found := pc[discoveryv1alpha1.AuthenticationStatusCondition]
	if found {
		clusterDto.Age = auth.LastTransitionTime.Time.String()
	}

	return clusterDto
}

func newResourceMetrics(cpuUsage, memUsage resource.Quantity, totalResources corev1.ResourceList) *ContainerResourceMetrics {
	return &ContainerResourceMetrics{
		TotalCpus:   totalResources.Cpu().AsApproximateFloat64(),
		TotalMemory: totalResources.Memory().AsApproximateFloat64(),
	}
}
