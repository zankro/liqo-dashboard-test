import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../../api/types';
import { bytesToGB } from '../../../utils/utils';
import './ClusterTreemapChart.css';
import * as d3 from 'd3';
import { ListFormat } from 'typescript';

interface colorMap {
  [key: string]: string;
}

interface LocalClusterTreemapChart {
  remoteClusters: ForeignCluster[];
  localCluster: ForeignCluster;
  showRam: boolean;
  clusterColors: colorMap;
}

function LocalClusterTreemapChart({
  remoteClusters,
  localCluster,
  showRam,
  clusterColors,
}: LocalClusterTreemapChart) {
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
  const localClusterColor = hashColor('Local Resources');
  const colors = [
    'white',
    ...remoteClusters.flatMap(cluster => {
      const clusterColor = clusterColors[cluster.name];
      return [
        clusterColor,
        darkenColor(clusterColor, 1),
        darkenColor(clusterColor, 4),
      ];
    }),
    localClusterColor,
    darkenColor(localClusterColor, 1),
    darkenColor(localClusterColor, 4),
  ];

  const findDuplicates = (arr: string[]) =>
    arr.filter((item: string, index: number) => arr.indexOf(item) !== index);

  const modifyDuplicateColors = (colorsArray: string[], offset: number) => {
    type colorMap = {
      color: number;
    };

    const colorCounts: colorMap = {
      color: 0,
    };
    colorsArray.forEach(color => {
      type colorMap = {
        [key: string]: number;
      };

      const colorCounts: colorMap = {
        color: 0,
      };

      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });

    const duplicates = findDuplicates(colorsArray);
    duplicates.forEach(duplicate => {
      const index = colorsArray.indexOf(duplicate);
      colorsArray[index] = changeColor(duplicate, offset);
    });

    return colorsArray;
  };

  const changeColor = (color: string, offset: number) => {
    const hsl = d3.hsl(color);
    hsl.h += offset;
    return hsl.toString();
  };

  const modifiedColors = modifyDuplicateColors(colors, 30);
  console.log(modifiedColors);

  return (
    <>
      <Plot
        className="prevent-select"
        data={[
          {
            labels: [
              localCluster.name,
              ...remoteClusters.flatMap(cluster => [
                cluster.name,
                cluster.name + ' Remaining',
                cluster.name + ' Used',
              ]),
              'Local Resources',
              'Remaining',
              'Used',
            ],
            parents: [
              '',
              ...remoteClusters.flatMap(cluster => [
                localCluster.name,
                cluster.name,
                cluster.name,
              ]),
              localCluster.name,
              'Local Resources',
              'Local Resources',
            ],
            branchvalues: 'total',
            type: 'treemap',
            domain: { x: [0, 1], y: [0, 1], column: 10, row: 10 },
            values: [
              remoteClusters.reduce(
                (accumulator, cluster) =>
                  accumulator +
                  (showRam
                    ? bytesToGB(cluster.TotalMemoryRecived)
                    : cluster.TotalCpusRecived),
                showRam
                  ? bytesToGB(localCluster.TotalLocalMemory)
                  : localCluster.TotalLocalCpus
              ),
              ...remoteClusters.flatMap(cluster => [
                showRam
                  ? bytesToGB(cluster.TotalMemoryRecived)
                  : cluster.TotalCpusRecived,
                showRam
                  ? bytesToGB(
                      cluster.TotalMemoryRecived -
                        cluster.TotalUsedMemoryRecived
                    )
                  : cluster.TotalCpusRecived - cluster.TotalUsedCpusRecived,
                showRam
                  ? bytesToGB(cluster.TotalUsedMemoryRecived)
                  : cluster.TotalUsedCpusRecived,
              ]),
              showRam
                ? bytesToGB(localCluster.TotalLocalMemory)
                : localCluster.TotalLocalCpus,
              showRam
                ? bytesToGB(
                    localCluster.TotalLocalMemory -
                      localCluster.TotalUsedLocalMemory
                  )
                : localCluster.TotalLocalCpus - localCluster.TotalUsedLocalCpus,
              showRam
                ? bytesToGB(localCluster.TotalUsedLocalMemory)
                : localCluster.TotalUsedLocalCpus,
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
    </>
  );
}

export default LocalClusterTreemapChart;
