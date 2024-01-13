import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../api/types';
import { bytesToGB } from '../../utils/utils';
import { Button, Container } from 'react-bootstrap';
import './Offloading.css';
import RemoteClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/RemoteClusterTreemapChart';
import LocalClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/LocalClusterTreemapChart';

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
  if (clusters.local.length > 0) {
    return (
      <Container className='no-side-margin'>
        <Container className="center">
          <LocalClusterTreemapChart
            localCluster={localCluster}
            remoteClusters={offloadingClusters}
            showRam={showRam}
          />
        </Container>
        <Container className=" no-side-margin overflow-auto d-flex flex-row justify-content-start align-self-center">
          {offloadingClusters.map((cluster, i) => {
            return (
              <RemoteClusterTreemapChart
                cluster={cluster}
                showRam={showRam}
                key={i}
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
