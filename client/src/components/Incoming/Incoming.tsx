import React from 'react';
import { ForeignCluster } from '../../api/types';
import { Container } from 'react-bootstrap';
import IncomingClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/IncomingClusterTreemapChart';
import PodsHorizontalBarChart from '../clusterComponent/PodsBarChart/PodsHorizontalBarChart';
import './Incoming.css';
export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  metric: String;
}

function Incoming(props: IClusterList) {
  const { clusters, metric } = props;
  const localCluster = clusters.local[0];
  const incomingClusters = clusters.remote.filter(
    c => c.incomingPeering == 'Established'
  );
  if (clusters.local.length > 0 && incomingClusters.length > 0) {
    return (
      <Container>
        <Container className="center">
          <h2>Clusters reciving resources</h2>
          <IncomingClusterTreemapChart
            remoteClusters={incomingClusters}
            localCluster={localCluster}
            metric={metric}
          />
        </Container>

        <Container className="clustersChart">
          {incomingClusters.map(cluster => (
            <Container className="podsChart" key={cluster.name}>
              <PodsHorizontalBarChart cluster={cluster} metric={metric} />
            </Container>
          ))}
        </Container>
      </Container>
    );
  } else {
    if (clusters.local.length !== 0 && incomingClusters.length === 0) {
      return (
        <>
          <Container className="no-side-margin">
            <Container className="center">
              <h2> No incoming clusters found </h2>
            </Container>
          </Container>
        </>
      );
    } else return <div> Loading... </div>;
  }
}

export default Incoming;
