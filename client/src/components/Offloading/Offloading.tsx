import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { ForeignCluster } from '../../api/types';
import { bytesToGB } from '../../utils/utils';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import Draggable from 'react-draggable';
import { Button } from 'react-bootstrap';

interface FrecceContainerProps {
  localCluster: ForeignCluster;
  showRam: boolean;
  remoteClusters: ForeignCluster[];
}
const boxStyle = {
  border: 'grey solid 2px',
  borderRadius: '10px',
  padding: '5px',
};

const FrecceContainer: React.FC<FrecceContainerProps> = ({
  localCluster,
  showRam,
  remoteClusters,
}) => {
  return (
    <div>
      <Xwrapper>
        <DraggableBox cluster={localCluster} showRam={showRam} id="elem1" />
        {remoteClusters.map((cluster, i) => (
          <>
            <DraggableBox
              cluster={cluster}
              showRam={showRam}
              id={`elem${i}`}
              key={i}
            />
            <Xarrow start={'elem1'} end={`elem${i}`} />
          </>
        ))}
      </Xwrapper>
    </div>
  );
};

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
  return (
    <Draggable onDrag={updateXarrow} onStop={updateXarrow}>
      <div id={id}>
        <ClusterChart cluster={cluster} showRam={showRam} id={id} />
      </div>
    </Draggable>
  );
};

export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function Offloading(props: IClusterList) {
  const { clusters } = props;
  const [showRam, setShowRam] = useState(true);
  const localCluster = clusters.local[0];
  if (clusters.local.length > 0) {
    return (
      <>
      <Button onClick={() => setShowRam((oldshowRam)=>!oldshowRam)}>{showRam?"RAM":"CPU"}</Button>
      <FrecceContainer
        localCluster={localCluster}
        showRam={showRam}
        remoteClusters={clusters.remote}
      />
      </>
    );
  } else {
    return <div> Loading... </div>;
  }
}

interface ClusterChartProps {
  cluster: ForeignCluster;
  showRam: boolean;
  id: string;
}

function ClusterChart({ cluster, showRam, id }: ClusterChartProps) {
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

export default Offloading;
