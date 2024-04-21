import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './RemoteClusterPieChart.css';
import * as d3 from 'd3';

interface RemoteClusterPieChart {
  cluster: ForeignCluster;
  metric: String;
  color: string;
}

function RemoteClusterPieChart({
  cluster,
  metric,
  color,
}: RemoteClusterPieChart) {
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
  const clusterColor = color;

  console.log(clusterColor);

  const values = [
    metric === 'Ram'
      ? bytesToGB(cluster.TotalMemoryReceived)
      : metric === 'CPU'
      ? cluster.TotalCpusReceived
      : 0,
    metric === 'Ram'
      ? bytesToGB(cluster.TotalMemoryReceived)
      : metric === 'CPU'
      ? cluster.TotalCpusReceived
      : 0,
    metric === 'Ram'
      ? bytesToGB(cluster.TotalUsedMemoryReceived)
      : metric === 'CPU'
      ? cluster.TotalUsedCpusReceived
      : 0,
  ];
  return (
    <>
      <Plot
        className="prevent-select"
        key={cluster.name}
        data={[
          {
            labels: ['Remaining', 'Used'],
            type: 'pie',
            values: [
              metric === 'Ram'
                ? bytesToGB(
                    cluster.TotalMemoryReceived -
                      cluster.TotalUsedMemoryReceived
                  )
                : metric === 'CPU'
                ? cluster.TotalCpusReceived - cluster.TotalUsedCpusReceived
                : 0,
              metric === 'Ram'
                ? bytesToGB(cluster.TotalUsedMemoryReceived)
                : metric === 'CPU'
                ? cluster.TotalUsedCpusReceived
                : 0,
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

export default RemoteClusterPieChart;
