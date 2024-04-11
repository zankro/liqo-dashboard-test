import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../api/types';
import * as CryptoJS from 'crypto-js';
import { Button, Card, Container } from 'react-bootstrap';
import './Offloading.css';
import RemoteClusterPiemapChart from '../clusterComponent/ClusterPieChart/RemoteClusterPieChart';
import LocalClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/LocalClusterTreemapChart';

export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  metric: String;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function Offloading(props: IClusterList) {
  const { clusters, metric } = props;
  const localCluster = clusters.local[0];
  const offloadingClusters = clusters.remote.filter(
    c => c.outgoingPeering == 'Established'
  );
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

  if (clusters.local.length > 0 && offloadingClusters.length > 0) {
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

    const values = Object.values(clusterColorMap);
    const keys = Object.keys(clusterColorMap);
    const newClusterColorMap: ClusterColorMap = {};
    keys.forEach((key, i) => {
      newClusterColorMap[key] = values[i];
    });

    return (
      <Container className="no-side-margin">
        <Container className="center">
          <h2>Clusters offering resources</h2>
          <LocalClusterTreemapChart
            localCluster={localCluster}
            remoteClusters={offloadingClusters}
            metric={metric}
            clusterColors={newClusterColorMap}
          />
        </Container>
        <Container className=" no-side-margin overflow-auto d-flex flex-row justify-content-start align-self-center">
          {offloadingClusters.map((cluster, i) => {
            return (
              <RemoteClusterPiemapChart
                cluster={cluster}
                metric={metric}
                key={i}
                color={newClusterColorMap[cluster.name]}
              />
            );
          })}
        </Container>
      </Container>
    );
  } else {
    if (clusters.local.length !== 0 && offloadingClusters.length === 0) {
      return (
        <>
          <Container className="no-side-margin">
            <Container className="center">
              <h2> No offloading clusters found </h2>
            </Container>
          </Container>
        </>
      );
    }
    return <div> Loading... </div>;
  }
}

export default Offloading;
