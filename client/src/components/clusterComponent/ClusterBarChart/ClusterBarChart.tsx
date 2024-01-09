import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './ClusterBarChart.css'

interface ClusterBarChartProps {
    cluster: ForeignCluster;
    showRam: boolean;
  }
  
  function ClusterBarChart({ cluster, showRam }: ClusterBarChartProps) {
    return (
      <>
        <Plot
            className='prevent-select'
          key={cluster.name}
          data={[
            {
              x: [showRam ? 'Memory (GB)' : 'CPU'],
              y: [
                showRam
                  ? bytesToGB(cluster.TotalUsedMemoryRecived)
                  : cluster.TotalUsedCpusRecived,
              ],
              type: 'bar',
              name: 'Used',
            },
            {
              x: [showRam ? 'Memory (GB)' : 'CPU'],
              y: [
                showRam
                  ? bytesToGB(cluster.TotalMemoryRecived)
                  : cluster.TotalCpusRecived,
              ],
              type: 'bar',
              name: 'Total',
            },
          ]}
          layout={{
            title: {text: cluster.name, pad: {l: 0, r: 0, t: 0, b: 0}},

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