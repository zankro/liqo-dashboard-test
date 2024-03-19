import React from 'react';
import Plot from 'react-plotly.js';
import { bytesToGB } from '../../../utils/utils';
import { PodResourceMetrics } from '../../../api/types';
import { ForeignCluster } from '../../../api/types';
import * as CryptoJS from 'crypto-js';
import * as d3 from 'd3';

interface Props {
  cluster: ForeignCluster;
  metric: String;
}

function hexToRgb(hex: string) {
  hex = hex.substring(0, 6);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    const rgb = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  }
  return 'rgb(1,1,100)';
}

function hashString(str: string) {
  const hash = CryptoJS.SHA256(str);
  console.log(hash.toString(CryptoJS.enc.Hex));
  return hash.toString(CryptoJS.enc.Hex);
}

function hashColor(str: string) {
  const hash = hashString(str);
  const color = hexToRgb(hash); // Convert hash to a number
  console.log(color);
  return color;
}

const darkenColor = (color: string, ratio: number) => {
  const darker = d3.hsl(color).darker(ratio);
  return darker.toString();
};

const PodsHorizontalBarChart: React.FC<Props> = ({ cluster, metric }) => {
  const xData = cluster.incomingResources.map((pod: PodResourceMetrics) =>
    metric === 'Ram'
      ? bytesToGB(pod.PodTotalMemory * 1024)
      : metric === 'CPU'
      ? pod.PodTotalCpus
      : 0
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
        title:
          metric === 'Ram'
            ? `${cluster.name} Pod's Memory in MB`
            : metric === 'CPU'
            ? `${cluster.name} Pod's CPUs in milliCores`
            : metric === 'GPU'
            ? `${cluster.name} Pod's GPUs in milliCores`
            : '',
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
