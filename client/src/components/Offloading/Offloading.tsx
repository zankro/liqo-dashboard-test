import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../api/types';
import { bytesToGB } from '../../utils/utils';
import { Button, Card, Container } from 'react-bootstrap';
import './Offloading.css';
import RemoteClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/RemoteClusterTreemapChart';
import LocalClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/LocalClusterTreemapChart';
import * as d3 from 'd3';

export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  showRam: boolean;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function Offloading(props: IClusterList) {
  const { clusters, showRam } = props;
  const localCluster = clusters.local[0];
  const offloadingClusters = clusters.remote.filter(
    c => c.outgoingPeering == 'Established'
  );
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

    let duplicates = findDuplicates(colorsArray);
    while (duplicates.length > 0) {
      duplicates.forEach(duplicate => {
        const index = colorsArray.indexOf(duplicate);
        colorsArray[index] = changeColor(duplicate, offset);
      });
      duplicates = findDuplicates(colorsArray);
    }

    return colorsArray;
  };

  const changeColor = (color: string, offset: number) => {
    const hsl = d3.hsl(color);
    hsl.h += offset * 2;

    return hsl.toString();
  };

  if (clusters.local.length > 0) {
    interface ClusterColorMap {
      [key: string]: string;
    }

    const clusterColorMap: ClusterColorMap = offloadingClusters.reduce(
      (map: ClusterColorMap, cluster, i) => {
        map[cluster.name] = hashColor(cluster.name); // replace 'i' with the color you want to assign
        return map;
      },
      {}
    );
    console.log(modifyDuplicateColors(Object.values(clusterColorMap), 30));

    const values = modifyDuplicateColors(Object.values(clusterColorMap), 30);
    const keys = Object.keys(clusterColorMap);
    const newClusterColorMap: ClusterColorMap = {};
    keys.forEach((key, i) => {
      newClusterColorMap[key] = values[i];
    });

    console.log(Object.values(newClusterColorMap));

    return (
      <Container className="no-side-margin">
        <Container className="center">
          <h2>Cluster che offrono risorse</h2>
          <LocalClusterTreemapChart
            localCluster={localCluster}
            remoteClusters={offloadingClusters}
            showRam={showRam}
            clusterColors={newClusterColorMap}
          />
        </Container>
        <Container className=" no-side-margin overflow-auto d-flex flex-row justify-content-start align-self-center">
          {offloadingClusters.map((cluster, i) => {
            return (
              <RemoteClusterTreemapChart
                cluster={cluster}
                showRam={showRam}
                key={i}
                color={newClusterColorMap[cluster.name]}
              />
            );
          })}
        </Container>
      </Container>
    );
  } else {
    return <div> Loading... </div>;
  }
}

export default Offloading;
