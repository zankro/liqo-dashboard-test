import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './ClusterTreemapChart.css';
import * as CryptoJS from 'crypto-js';
import * as d3 from 'd3';

interface IncomingClusterTreemapChartProps {
  remoteClusters: ForeignCluster[];
  localCluster: ForeignCluster;
  metric: String;
}

const IncomingClusterTreemapChart: React.FC<
  IncomingClusterTreemapChartProps
> = ({ remoteClusters, localCluster, metric }) => {
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
  const values = [
    metric === 'Ram'
      ? bytesToGB(localCluster.clusterMemory)
      : metric === 'CPU'
      ? localCluster.clusterCPU
      : 0,
    ...remoteClusters.flatMap(cluster => [
      metric === 'Ram'
        ? bytesToGB(cluster.TotalMemoryOffered)
        : metric === 'CPU'
        ? cluster.TotalCpusOffered
        : 0,
      metric === 'Ram'
        ? bytesToGB(cluster.TotalMemoryOffered - cluster.TotalUsedMemoryOffered)
        : metric === 'CPU'
        ? cluster.TotalCpusOffered - cluster.TotalUsedCpusOffered
        : 0,
      metric === 'Ram'
        ? bytesToGB(cluster.TotalUsedMemoryOffered)
        : metric === 'CPU'
        ? cluster.TotalUsedCpusOffered
        : 0,
    ]),
  ];

  console.log(values);

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
            metric === 'Ram'
              ? bytesToGB(localCluster.clusterMemory)
              : metric === 'CPU'
              ? localCluster.clusterCPU
              : 0,
            ...remoteClusters.flatMap(cluster => [
              metric === 'Ram'
                ? bytesToGB(cluster.TotalMemoryOffered)
                : metric === 'CPU'
                ? cluster.TotalCpusOffered
                : 0,
              metric === 'Ram'
                ? bytesToGB(
                    cluster.TotalMemoryOffered - cluster.TotalUsedMemoryOffered
                  )
                : metric === 'CPU'
                ? cluster.TotalCpusOffered - cluster.TotalUsedCpusOffered
                : 0,
              metric === 'Ram'
                ? bytesToGB(cluster.TotalUsedMemoryOffered)
                : metric === 'CPU'
                ? cluster.TotalUsedCpusOffered
                : 0,
            ]),
          ],
          textinfo: 'label+value+percent',
          marker: { colors: colors },
        },
      ]}
      layout={{
        title: localCluster.name,
        autosize: true,
      }}
    />
  );
};

export default IncomingClusterTreemapChart;
