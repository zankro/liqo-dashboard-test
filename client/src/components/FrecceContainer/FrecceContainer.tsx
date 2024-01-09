import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import Draggable from 'react-draggable';
import {  Container } from 'react-bootstrap';
import ClusterBarChart from '../clusterComponent/ClusterBarChart/ClusterBarChart';


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
              <Xarrow endAnchor='top' labels={`Latency: ${cluster.Latency.value}`} showTail={cluster.incomingPeering==="Established"} showHead={cluster.outgoingPeering==="Established"} start={'elem1'} end={`elem${i+2}`} path='grid' />
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
    const x= id=="elem1"?600:700*(parseInt(id.substring(4))-2)
    const y= id=="elem1"?0:150
    return (
      <Draggable   defaultPosition={{x:x, y:y}}  onDrag={updateXarrow} onStop={updateXarrow}>
        <div className="arrow-box" id={id}>
          <ClusterBarChart cluster={cluster} showRam={true}/>
        </div>
      </Draggable>
    );
  };
  
export default FrecceContainer;