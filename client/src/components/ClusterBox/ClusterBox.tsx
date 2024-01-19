import React from 'react';
import { ForeignCluster } from '../../api/types';
import Xarrow, { useXarrow } from 'react-xarrows';
import ClusterBubbleChart from '../clusterComponent/ClusterBubbleChart/ClusterBubbleChart';
import './ClusterBox.css';

interface ClusterBoxProps {
  id: string;
  clusters: ForeignCluster[];
  showRam: boolean;
}

const ClusterBox: React.FC<ClusterBoxProps> = ({
  id,
  clusters,
  showRam,
}) => {

  const index = parseInt(id.substring(4));

  return (  
      <div className="arrow-box " id={id}  style={{
              paddingBottom: '40px',
            }}>
            {clusters.map((cluster) => 
                <ClusterBubbleChart cluster={cluster} showRam={showRam} key={cluster.name}/>            
            )}
      </div>
  );
};

export default ClusterBox;