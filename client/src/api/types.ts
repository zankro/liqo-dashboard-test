export type ForeignCluster = {
  name: string;
  networking: string;
  authentication: string;
  outgoingPeering: string;
  incomingPeering: string;
  age: string;
  outgoingResources: NodeResourceMetrics[];
  incomingResources: PodResourceMetrics[];
  TotalUsedCpusOffered: number;
  TotalUsedMemoryOffered: number;
  TotalUsedMemoryRecived: number;
  TotalUsedCpusRecived: number;
  TotalMemoryRecived: number;
  TotalCpusRecived: number;
  TotalMemoryOffered: number;
  TotalCpusOffered: number;
  Latency: ConnectionLatency;
  localResources: LocalResources[];
  TotalUsedLocalCpus: number;
  TotalUsedLocalMemory: number;
  TotalLocalCpus: number;
  TotalLocalMemory: number;
};

export type NodeResourceMetrics = {
  name: string;
  cpu: number;
  memory: number;
  Pods: PodResourceMetrics[];
};

export type PodResourceMetrics = {
  name: string;
  containersResources: ContainerResourceMetrics[];
  PodTotalMemory: number;
  PodTotalCpus: number;
};

export type ContainerResourceMetrics = {
  name: string;
  TotalMemory: number;
  TotalCpus: number;
};

export type ConnectionLatency = {
  value: string;
  timestamp: string;
};

export type LocalResources = {
  nodeTotalCpus: number;
  nodeTotalMemory: number;
};
/*
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
*/

export type ResourcesMetrics = {
  totalCpus: number;
  totalMemory: number;
  usedCpus: number;
  usedMemory: number;
};

export enum ResourcesType {
  Incoming = 'Imported Resources',
  Outgoing = 'Exported Resources',
}
