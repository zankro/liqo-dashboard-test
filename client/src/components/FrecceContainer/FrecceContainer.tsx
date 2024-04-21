import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import ClusterBox from '../ClusterBox/ClusterBox';
import { Container, Card } from 'react-bootstrap';
import ClusterBubbleChart from '../clusterComponent/ClusterBubbleChart/ClusterBubbleChart';
import './FrecceContainer.css';
import * as CryptoJS from 'crypto-js';

interface FrecceContainerProps {
  localCluster: ForeignCluster;
  remoteClusters: ForeignCluster[];
  metric: String;
}
const FrecceContainer: React.FC<FrecceContainerProps> = ({
  localCluster,
  remoteClusters,
  metric,
}) => {
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

  interface ClusterColorMap {
    [key: string]: string;
  }

  const clusterColorMap: ClusterColorMap = remoteClusters.reduce(
    (map: ClusterColorMap, cluster, i) => {
      map[cluster.name] = hashColor(cluster.name); // replace 'i' with the color you want to assign
      return map;
    },
    {}
  );
  return (
    <Container
      style={{
        background: 'white',
        display: 'flex',
        color: 'black',
      }}
    >
      <Xwrapper>
        <Container className="d-flex flex-column justify-content-between">
          <div
            style={{
              paddingBottom: '100px',
            }}
          >
            <ClusterBubbleChart
              clusterColor={'#ff0000'}
              type={'local'}
              cluster={localCluster}
              metric={metric}
            />
          </div>

          <Container className="d-flex flex-row justify-content-between">
            {remoteClusters.filter(
              cluster => cluster.incomingPeering === 'Established'
            ).length > 0 ? (
              <>
                <Card id={'incomingCard'} className="incoming">
                  <Card.Title className="centered-card-title">
                    Incoming
                  </Card.Title>
                  <ClusterBox
                    colorMap={clusterColorMap}
                    clusters={remoteClusters.filter(
                      cluster => cluster.incomingPeering === 'Established'
                    )}
                    id={`incoming`}
                    key={'incoming'}
                    metric={metric}
                  />
                </Card>

                <Xarrow
                  endAnchor="top"
                  showTail={true}
                  showHead={false}
                  start={localCluster.name}
                  key={'incomingArrow'}
                  end={`incomingCard`}
                />
              </>
            ) : (
              ''
            )}

            {remoteClusters.filter(
              cluster => cluster.outgoingPeering == 'Established'
            ).length > 0 ? (
              <>
                <Card id={'outgoingCard'} className="outgoing">
                  <Card.Title className="centered-card-title">
                    Outgoing
                  </Card.Title>
                  <ClusterBox
                    colorMap={clusterColorMap}
                    clusters={remoteClusters.filter(
                      cluster => cluster.outgoingPeering === 'Established'
                    )}
                    id={`outgoing`}
                    key={`outgoing`}
                    metric={metric}
                  />
                </Card>
                <Xarrow
                  endAnchor="top"
                  showHead={true}
                  start={localCluster.name}
                  key={'outgoingArrow'}
                  end={`outgoingCard`}
                />
              </>
            ) : (
              ''
            )}
          </Container>
        </Container>
      </Xwrapper>
    </Container>
  );
};

export default FrecceContainer;
