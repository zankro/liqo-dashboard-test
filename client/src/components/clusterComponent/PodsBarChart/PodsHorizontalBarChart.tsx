import React from 'react';
import Plot from 'react-plotly.js';
import { bytesToGB } from '../../../utils/utils';
import { PodResourceMetrics } from '../../../api/types';
import { ForeignCluster } from '../../../api/types';

interface Props {
  cluster: ForeignCluster;
  showRam: boolean;
}

const PodsHorizontalBarChart: React.FC<Props> = ({ cluster, showRam }) => {
  const xData = cluster.incomingResources.map((pod: PodResourceMetrics) =>
    showRam ? bytesToGB(pod.PodTotalMemory) * 1024 : pod.PodTotalCpus
  );
  const yData = cluster.incomingResources.map(
    (pod: PodResourceMetrics) => pod.name
  );

  return (
    <Plot
      data={[
        {
          x: xData,
          y: yData,
          type: 'bar',
          orientation: 'h',
        },
      ]}
      layout={{
        title: showRam
          ? `${cluster.name} Pod's Memory in MB`
          : `${cluster.name} Pod's CPUs in milliCores`,
        width: 600, // Increase the height of the plot
        margin: {
          l: 100, // Increase the left margin
          r: 50,
          b: 100, // Increase the bottom margin
          t: 100,
          pad: 4,
        },
      }}
    />
  );
};

export default PodsHorizontalBarChart;
