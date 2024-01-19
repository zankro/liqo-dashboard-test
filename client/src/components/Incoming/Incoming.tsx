import React from 'react';
import { ForeignCluster } from '../../api/types';
import { Container } from 'react-bootstrap';
import IncomingClusterTreemapChart from '../clusterComponent/ClusterTreemapChart/IncomingClusterTreemapChart';
import PodsHorizontalBarChart from '../clusterComponent/PodsBarChart/PodsHorizontalBarChart';
import './Incoming.css';
export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  showRam: boolean;
}

function Incoming(props: IClusterList) {
  const { clusters, showRam } = props;
  const localCluster = clusters.local[0];
  const incomingClusters = clusters.remote.filter(
    c => c.incomingPeering == 'Established'
  );
  if (clusters.local.length > 0) {
    console.log(clusters.remote[0].incomingResources[0]);
    return (
      <Container>
        <Container className="center">
          <IncomingClusterTreemapChart
            remoteClusters={incomingClusters}
            localCluster={localCluster}
            showRam={showRam}
          />
        </Container>

        <Container className="clustersChart">
          {incomingClusters.map(cluster => (
            <Container className="podsChart">
              <PodsHorizontalBarChart cluster={cluster} showRam={showRam} />
            </Container>
          ))}
        </Container>
      </Container>
    );
  } else {
    return <div> Loading... </div>;
  }
}

export default Incoming;
