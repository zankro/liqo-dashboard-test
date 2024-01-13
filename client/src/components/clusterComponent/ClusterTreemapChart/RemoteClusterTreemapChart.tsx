import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './ClusterTreemapChart.css';
import * as d3 from 'd3';

interface RemoteClusterTreemapChart {
  cluster: ForeignCluster;
  showRam: boolean;
}

function RemoteClusterTreemapChart({
  cluster,
  showRam,
}: RemoteClusterTreemapChart) {
  function hashString(str: String) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 4) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  function hashColor(str: String) {
    const hash = hashString(str);
    const color = d3.interpolateRainbow(Math.abs(hash) / 0xffffffff);
    return color;
  }
  function darkenColor(color: string, ratio: number) {
    const darker = d3.hsl(color).darker(ratio);
    return darker.toString();
  }
  const clusterColor = hashColor(cluster.name);
  const values = [
    showRam ? bytesToGB(cluster.TotalMemoryRecived) : cluster.TotalCpusRecived,
    showRam ? bytesToGB(cluster.TotalMemoryRecived) : cluster.TotalCpusRecived,
    showRam
      ? bytesToGB(cluster.TotalUsedMemoryRecived)
      : cluster.TotalUsedCpusRecived,
  ];
  return (
    <>
      <Plot
        className="prevent-select"
        key={cluster.name}
        data={[
          {
            labels: [cluster.name, 'Remaining', 'Used'],
            parents: ['', cluster.name, cluster.name],
            type: 'treemap',
            values: [
              showRam
                ? bytesToGB(cluster.TotalMemoryRecived)
                : cluster.TotalCpusRecived,
              showRam
                ? bytesToGB(
                    cluster.TotalMemoryRecived - cluster.TotalUsedMemoryRecived
                  )
                : cluster.TotalCpusRecived - cluster.TotalUsedCpusRecived,
              showRam
                ? bytesToGB(cluster.TotalUsedMemoryRecived)
                : cluster.TotalUsedCpusRecived,
            ],
            marker: {
              colors: [
                clusterColor,
                darkenColor(clusterColor, 1),
                darkenColor(clusterColor, 4),
              ],
            },
          },
        ]}
        layout={{
          title: { text: cluster.name, pad: { l: 0, r: 0, t: 0, b: 0 } },

          width: 400,
          height: 400,
          yaxis: {
            type: 'log',
            autorange: true,
            showticklabels: true,
            showgrid: true,
          },
        }}
      />
    </>
  );
}

export default RemoteClusterTreemapChart;
