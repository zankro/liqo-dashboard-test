import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import ClusterBox from '../ClusterBox/ClusterBox';
import { Container, Card } from 'react-bootstrap';
import ClusterBubbleChart from '../clusterComponent/ClusterBubbleChart/ClusterBubbleChart';
interface FrecceContainerProps {
  localCluster: ForeignCluster;
  remoteClusters: ForeignCluster[];
  showRam: boolean;
}
function updateXarrow() {}
const FrecceContainer: React.FC<FrecceContainerProps> = ({
  localCluster,
  remoteClusters,
  showRam,
}) => {
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
            <ClusterBubbleChart cluster={localCluster} showRam={showRam} />
          </div>

          <Container className="d-flex flex-row justify-content-between">
            {remoteClusters.filter(
              cluster =>
                cluster.incomingPeering === 'Established' &&
                cluster.outgoingPeering !== 'Established'
            ).length > 0 ? (
              <>
                <Card className="incoming">
                  <ClusterBox
                    clusters={remoteClusters.filter(
                      cluster =>
                        cluster.incomingPeering === 'Established' &&
                        cluster.outgoingPeering !== 'Established'
                    )}
                    id={`incoming`}
                    key={'incoming'}
                    showRam={showRam}
                  />
                </Card>

                <Xarrow
                  endAnchor="top"
                  showTail={true}
                  start={localCluster.name}
                  key={'incomingArrow'}
                  end={`incoming`}
                />
              </>
            ) : (
              ''
            )}

            {remoteClusters.filter(
              cluster =>
                cluster.incomingPeering === 'Established' &&
                cluster.outgoingPeering === 'Established'
            ).length > 0 ? (
              <>
                <Card className="both">
                  <ClusterBox
                    clusters={remoteClusters.filter(
                      cluster =>
                        cluster.incomingPeering === 'Established' &&
                        cluster.outgoingPeering === 'Established'
                    )}
                    id={`both`}
                    key={'both'}
                    showRam={showRam}
                  />
                </Card>
                <Xarrow
                  endAnchor="top"
                  showTail={true}
                  showHead={true}
                  start={localCluster.name}
                  key={'bothArrow'}
                  end={`both`}
                />
              </>
            ) : (
              ''
            )}

            {remoteClusters.filter(
              cluster =>
                cluster.outgoingPeering == 'Established' &&
                cluster.incomingPeering !== 'Established'
            ).length > 0 ? (
              <>
                <Card className="outgoing">
                  <ClusterBox
                    clusters={remoteClusters.filter(
                      cluster =>
                        cluster.outgoingPeering === 'Established' &&
                        cluster.incomingPeering !== 'Established'
                    )}
                    id={`outgoing`}
                    key={`outgoing`}
                    showRam={showRam}
                  />
                </Card>
                <Xarrow
                  endAnchor="top"
                  showHead={true}
                  start={localCluster.name}
                  key={'outgoingArrow'}
                  end={`outgoing`}
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
