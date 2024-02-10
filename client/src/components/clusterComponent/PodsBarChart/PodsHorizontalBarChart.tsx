import React from 'react';
import Plot from 'react-plotly.js';
import { bytesToGB } from '../../../utils/utils';
import { PodResourceMetrics } from '../../../api/types';
import { ForeignCluster } from '../../../api/types';
import * as d3 from 'd3';
import { isConstructorDeclaration } from 'typescript';

interface Props {
  cluster: ForeignCluster;
  showRam: boolean;
}

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 4) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const hashColor = (str: string) => {
  const hash = hashString(str);
  const color = d3.interpolateRainbow(Math.abs(hash) / 0xffffffff);
  return color;
};

const darkenColor = (color: string, ratio: number) => {
  const darker = d3.hsl(color).darker(ratio);
  return darker.toString();
};

const PodsHorizontalBarChart: React.FC<Props> = ({ cluster, showRam }) => {
  const xData = cluster.incomingResources.map((pod: PodResourceMetrics) =>
    showRam ? bytesToGB(pod.PodTotalMemory * 1024) : pod.PodTotalCpus
  );

  console.log(cluster.incomingResources, xData);
  const yData = cluster.incomingResources.map(
    (pod: PodResourceMetrics) => pod.name
  );
  const color = hashColor(cluster.name);
  return (
    <Plot
      data={[
        {
          x: xData,
          y: yData,
          type: 'bar',
          orientation: 'h',
          marker: { color: color },
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
