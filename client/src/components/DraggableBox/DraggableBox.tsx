import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import Draggable from 'react-draggable';
import ClusterBubbleChart from '../clusterComponent/ClusterBubbleChart/ClusterBubbleChart';

interface DraggableBoxProps {
  id: string;
  cluster: ForeignCluster;
  showRam: boolean;
}

const DraggableBox: React.FC<DraggableBoxProps> = ({
  id,
  cluster,
  showRam,
}) => {
  const updateXarrow = useXarrow();
  const x = id == 'elem1' ? 600 : 700 * ((parseInt(id.substring(4)) - 2) % 2);
  const y = id == 'elem1' ? 0 : 150 * (parseInt(id.substring(4)) / 2);
  return (
    <Draggable
      defaultPosition={{ x: x, y: y }}
      onDrag={updateXarrow}
      onStop={updateXarrow}
    >
      <div className="arrow-box" id={id}>
        <ClusterBubbleChart cluster={cluster} showRam={showRam} />
      </div>
    </Draggable>
  );
};

export default DraggableBox;
