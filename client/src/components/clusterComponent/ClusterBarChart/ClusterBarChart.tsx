import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './ClusterBarChart.css';

interface ClusterBarChartProps {
  cluster: ForeignCluster;
  metric: String;
}

function ClusterBarChart({ cluster, metric }: ClusterBarChartProps) {
  return (
    <>
      <Plot
        className="prevent-select"
        key={cluster.name}
        data={[
          {
            x: [metric === 'Ram' ? 'Memory (GB)' : `${metric}`],
            y: [
              metric === 'Ram'
                ? bytesToGB(cluster.TotalUsedMemoryRecived)
                : metric === 'CPU'
                ? cluster.TotalUsedCpusRecived
                : 0,
            ],
            type: 'bar',
            name: 'Used',
          },
          {
            x: [metric === 'Ram' ? 'Memory (GB)' : `${metric}`],
            y: [
              metric === 'Ram'
                ? bytesToGB(cluster.TotalMemoryRecived)
                : metric === 'CPU'
                ? cluster.TotalCpusRecived
                : 0,
            ],
            type: 'bar',
            name: 'Total',
          },
        ]}
        layout={{
          title: { text: cluster.name, pad: { l: 0, r: 0, t: 0, b: 0 } },

          width: 400,
          height: 400,
          barmode: 'stack',
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

export default ClusterBarChart;
