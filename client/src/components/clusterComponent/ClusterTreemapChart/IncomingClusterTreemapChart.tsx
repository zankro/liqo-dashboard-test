import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './ClusterTreemapChart.css';
import * as d3 from 'd3';

interface IncomingClusterTreemapChartProps {
  remoteClusters: ForeignCluster[];
  localCluster: ForeignCluster;
  showRam: boolean;
}

const IncomingClusterTreemapChart: React.FC<IncomingClusterTreemapChartProps> = ({
  remoteClusters,
  localCluster,
  showRam,
}) => {
  console.log(remoteClusters);
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

  const localClusterColor = hashColor('Local Resources');
  const colors = [
    localClusterColor,
    ...remoteClusters.flatMap(cluster => {
      const clusterColor = hashColor(cluster.name);
      return [
        clusterColor,
        darkenColor(clusterColor, 1),
        darkenColor(clusterColor, 4),
      ];
    }),
  ];

  return (
    <Plot
      className="prevent-select"
      data={[
        {
          labels: [
            'Local Resources',
            ...remoteClusters.flatMap(cluster => [
              cluster.name,
              `${cluster.name} Remaining`,
              `${cluster.name} Used`,
            ]),
          ],
          parents: [
            '',
            ...remoteClusters.flatMap(cluster => [
              'Local Resources',
              cluster.name,
              cluster.name,
            ]),
          ],
          branchvalues: 'remainder',
          type: 'treemap',
          domain: { x: [0, 1], y: [0, 1] },
          values: [
            showRam
              ? bytesToGB(localCluster.TotalLocalMemory)
              : localCluster.TotalLocalCpus,
            ...remoteClusters.flatMap(cluster => [
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
            ]),
          ],
          textinfo: 'label+value+percent',
          marker: { colors: colors },
        },
      ]}
      layout={{
        autosize: true,
      }}
    />
  );
};

export default IncomingClusterTreemapChart;
