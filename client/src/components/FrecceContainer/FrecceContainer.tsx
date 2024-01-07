import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import Draggable from 'react-draggable';
import {  Container } from 'react-bootstrap';



interface FrecceContainerProps {
    localCluster: ForeignCluster;
    remoteClusters: ForeignCluster[];
  }
  
  const FrecceContainer: React.FC<FrecceContainerProps> = ({
    localCluster,
    remoteClusters,
  }) => {
    return (
      <Container style={{
        background: 'white',
        display: 'flex',
        color: 'black',
      }}>      
        <Xwrapper>
          <DraggableBox cluster={localCluster}  id="elem1" />
          {remoteClusters.map((cluster, i) => (
            <div>
              <DraggableBox
                cluster={cluster}
                id={`elem${i+2}`}
                key={i}
                
              />
              <Xarrow labels={`Latency: ${cluster.Latency.value}\nTimestamp: ${cluster.Latency.timestamp}`} showTail={cluster.incomingPeering==="Established"} start={'elem1'} end={`elem${i+2}`} />
            </div>
          ))}
        </Xwrapper>
      </Container>
    );
  };
  
  interface DraggableBoxProps {
    id: string;
    cluster: ForeignCluster;
  
  }
  
  const DraggableBox: React.FC<DraggableBoxProps> = ({
    id,
    cluster,
  
  }) => {
    const updateXarrow = useXarrow();
    const x= id=="elem1"?400:700
    const y= id=="elem1"?50:70*(parseInt(id.substring(4))-3)
    return (
      <Draggable   defaultPosition={{x:x, y:y}}  onDrag={updateXarrow} onStop={updateXarrow}>
        <div className="arrow-box" id={id}>
          {cluster.name}
        </div>
      </Draggable>
    );
  };
  
export default FrecceContainer;