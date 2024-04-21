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
  TotalUsedMemoryReceived: number;
  TotalUsedCpusReceived: number;
  TotalMemoryReceived: number;
  TotalCpusReceived: number;
  TotalMemoryOffered: number;
  TotalCpusOffered: number;
  Latency: ConnectionLatency;
  localResources: LocalResources[];
  clusterCpuUsage: number;
  clusterMemoryUsage: number;
  clusterCPU: number;
  clusterMemory: number;
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
