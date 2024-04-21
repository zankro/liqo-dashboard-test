package utils

import (
	discoveryv1alpha1 "github.com/liqotech/liqo/apis/discovery/v1alpha1"
	net "github.com/liqotech/liqo/apis/net/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
)

// ClusterDto represents the data of a cluster which is returned to the client.
type ClusterDto struct {
	clusterID               string
	Name                    string                                       `json:"name"`
	Networking              discoveryv1alpha1.PeeringConditionStatusType `json:"networking"`
	Authentication          discoveryv1alpha1.PeeringConditionStatusType `json:"authentication"`
	OutgoingPeering         discoveryv1alpha1.PeeringConditionStatusType `json:"outgoingPeering"`
	OutgoingResources       *[]NodeResourceMetrics                       `json:"outgoingResources"`
	IncomingPeering         discoveryv1alpha1.PeeringConditionStatusType `json:"incomingPeering"`
	IncomingResources       *[]PodResourceMetrics                        `json:"incomingResources"`
	Age                     string                                       `json:"age,omitempty"`
	TotalUsedCpusOffered    float64                                      `json:"TotalUsedCpusOffered"`
	TotalUsedMemoryOffered  float64                                      `json:"TotalUsedMemoryOffered"`
	TotalCpusOffered        float64                                      `json:"TotalCpusOffered"`
	TotalMemoryOffered      float64                                      `json:"TotalMemoryOffered"`
	TotalUsedMemoryReceived float64                                      `json:"TotalUsedMemoryReceived"`
	TotalUsedCpusReceived   float64                                      `json:"TotalUsedCpusReceived"`
	TotalMemoryReceived     float64                                      `json:"TotalMemoryReceived"`
	TotalCpusReceived       float64                                      `json:"TotalCpusReceived"`
	ClusterCPU              float64                                      `json:"clusterCPU"`
	ClusterMemory           float64                                      `json:"clusterMemory"`
	ClusterCpuUsage         float64                                      `json:"clusterCpuUsage"`
	ClusterMemoryUsage      float64                                      `json:"clusterMemoryUsage"`
	Latency                 net.ConnectionLatency                        `json:"Latency"`
	LocalResources          *[]NodeResourceMetrics                       `json:"localResources"`
}

type LocalClusterResourcesMetrics struct {
	TotalCpus   float64 `json:"TotalCpus"`
	TotalMemory float64 `json:"TotalMemory"`
	UsedCpus    float64 `json:"UsedCpus"`
	UsedMemory  float64 `json:"UsedMemory"`
}

// NamespaceResourceMetrics represents the metrics of a node
type NodeResourceMetrics struct {
	Name        string  `json:"name"`
	TotalCpus   float64 `json:"NodeTotalCpus"`
	TotalMemory float64 `json:"NodeTotalMemory"`
	Pods        *[]PodResourceMetrics
}

// ResourceMetrics represents the metrics of a cluster which is returned to the client.
type PodResourceMetrics struct {
	Name                string                      `json:"name"`
	ContainersResources *[]ContainerResourceMetrics `json:"containersResources"`
	TotalMemory         float64                     `json:"PodTotalMemory"`
	TotalCpus           float64                     `json:"PodTotalCpus"`
}

type ContainerResourceMetrics struct {
	Name        string  `json:"name"`
	TotalMemory float64 `json:"ContainerTotalMemory"`
	TotalCpus   float64 `json:"ContainerTotalCpus"`
}

// ErrorResponse is returned to the client in case of error.
type ErrorResponse struct {
	Message string `json:"message"`
	Status  int16  `json:"status"`
}

func fromForeignCluster(fc *discoveryv1alpha1.ForeignCluster) *ClusterDto {
	pc := peeringConditionsToMap(fc.Status.PeeringConditions)

	clusterDto := &ClusterDto{
		Name:              fc.Name,
		clusterID:         fc.Spec.ClusterIdentity.ClusterID,
		OutgoingPeering:   statusOrDefault(pc, discoveryv1alpha1.OutgoingPeeringCondition),
		IncomingPeering:   statusOrDefault(pc, discoveryv1alpha1.IncomingPeeringCondition),
		Networking:        statusOrDefault(pc, discoveryv1alpha1.NetworkStatusCondition),
		Authentication:    statusOrDefault(pc, discoveryv1alpha1.AuthenticationStatusCondition),
		OutgoingResources: &[]NodeResourceMetrics{},
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
