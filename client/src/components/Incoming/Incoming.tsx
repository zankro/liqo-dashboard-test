import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../api/types';
import { bytesToGB } from '../../utils/utils';
import { Button, Container } from 'react-bootstrap';

export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function Incoming(props: IClusterList) {
  const { clusters } = props;
  const [showRam, setShowRam] = useState(true);
  const localCluster = clusters.local[0];
  const incomingClusters = clusters.remote.filter(
    c => c.incomingPeering == 'Established'
  );
  if (clusters.local.length > 0) {
    return (
      <Container className="center">
        <Button
          style={{
            background: 'white',
            color: 'black',
            border: '2px solid linear-gradient(45deg, #add8e6, #87CEFA)',
          }}
          onClick={() => setShowRam(oldshowRam => !oldshowRam)}
        >
          {showRam ? 'Mostra CPU' : 'Mostra RAM'}
        </Button>
        <ClusterChart cluster={localCluster} showRam={showRam} />
        <Container className="d-flex flex-row justify-content-center align-self-center">
          {incomingClusters.map((cluster, i) => {
            return <ClusterChart cluster={cluster} showRam={showRam} key={i} />;
          })}
        </Container>
      </Container>
    );
  } else {
    return <div> Loading... </div>;
  }
}

interface ClusterChartProps {
  cluster: ForeignCluster;
  showRam: boolean;
}

function ClusterChart({ cluster, showRam }: ClusterChartProps) {
  return (
    <>
      <Plot
        key={cluster.name}
        data={[
          {
            x: [showRam ? 'Memory (GB)' : 'CPU'],
            y: [
              showRam
                ? bytesToGB(cluster.TotalUsedMemoryOffered)
                : cluster.TotalUsedCpusOffered,
            ],
            type: 'bar',
            name: 'Used',
          },
          {
            x: [showRam ? 'Memory (GB)' : 'CPU'],
            y: [
              showRam
                ? bytesToGB(cluster.TotalMemoryOffered)
                : cluster.TotalCpusOffered,
            ],
            type: 'bar',
            name: 'Total',
          },
        ]}
        layout={{
          title: cluster.name,
          width: 500,
          height: 500,
          barmode: 'stack',
          yaxis: {
            type: 'log',
            autorange: true,
            showticklabels: false,
            showgrid: false,
          },
        }}
      />
    </>
  );
}

export default Incoming;
