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
  clusters.remote = clusters.remote.filter(c => c.outgoingPeering == "Established")
  if (clusters.local.length > 0) {
    return (
      <Container>
                <Button
                style={
                  {
                    marginLeft: '50%',
                    marginRight: '50%',
                    background: 'white',
                    color: 'black',
                    border: '2px solid linear-gradient(45deg, #add8e6, #87CEFA)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }
                }
                onClick={() => setShowRam((oldshowRam)=>!oldshowRam)}>{showRam?"RAM":"CPU"}
                </Button>
                <Container>
                {
                  clusters.remote.map((cluster, i) => {
                    if(i!=clusters.remote.length/2)
                        return<>
                          <ClusterChart
                            cluster={cluster}
                            showRam={showRam}
                            key={i}
                          />
                          </>
                    else
                      return<>
                          <ClusterChart
                          cluster={localCluster}
                          showRam={showRam}
                          key={i}
                        />
                        <ClusterChart
                          cluster={cluster}
                          showRam={showRam}
                          key={i}
                        />
                        </>
                  })  
                }
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
          title:cluster.name,
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
