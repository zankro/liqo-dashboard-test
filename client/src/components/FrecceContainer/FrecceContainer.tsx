import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import DraggableBox from '../DraggableBox/DraggableBox';
import { Container } from 'react-bootstrap';
interface FrecceContainerProps {
  localCluster: ForeignCluster;
  remoteClusters: ForeignCluster[];
  showRam: boolean;
}

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
        <DraggableBox showRam={showRam} cluster={localCluster} id="elem1" />
        {remoteClusters.map((cluster, i) => (
          <div>
            <DraggableBox
              cluster={cluster}
              id={`elem${i + 2}`}
              key={i}
              showRam={showRam}
            />
            <Xarrow
              endAnchor="top"
              labels={`Latency: ${cluster.Latency.value}`}
              showTail={cluster.incomingPeering === 'Established'}
              showHead={cluster.outgoingPeering === 'Established'}
              start={'elem1'}
              end={`elem${i + 2}`}
            />
          </div>
        ))}
      </Xwrapper>
    </Container>
  );
};

export default FrecceContainer;
