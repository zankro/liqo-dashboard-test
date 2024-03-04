import React from 'react';
import { ForeignCluster } from '../../../api/types';
import { BsCircleFill } from 'react-icons/bs';
import { Container, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { GrCloudComputer } from 'react-icons/gr';
import { bytesToGB } from '../../../utils/utils';

interface ClusterBubbleChartProps {
  cluster: ForeignCluster;
  showRam: boolean;
}

const ClusterBubbleChart: React.FC<ClusterBubbleChartProps> = ({
  cluster,
  showRam,
}) => {
  const calculateSize = (cluster: ForeignCluster, showRam: boolean) => {
    let value = 0;
    if (cluster.incomingPeering === 'Established') {
      value += showRam
        ? bytesToGB(cluster.TotalMemoryOffered)
        : cluster.TotalCpusOffered;
    }
    if (cluster.outgoingPeering === 'Established') {
      value += showRam
        ? bytesToGB(cluster.TotalMemoryRecived)
        : cluster.TotalCpusRecived;
    }
    if (
      cluster.incomingPeering === 'Established' &&
      cluster.outgoingPeering === 'Established'
    ) {
      value = value / 2;
    }
    return value;
  };

  const size = calculateSize(cluster, showRam);

  let hoverText = [
    <p key="name">
      {cluster.name.charAt(0).toUpperCase() + cluster.name.slice(1)}
    </p>,
  ];
  if (cluster.incomingPeering === 'Established') {
    hoverText.push(
      <p key="incoming">
        {showRam
          ? `TotalMemoryOffered: ${bytesToGB(cluster.TotalMemoryOffered)} GB`
          : `TotalCpusOffered: ${cluster.TotalCpusOffered} MilliCores`}
      </p>
    );
  }
  if (cluster.outgoingPeering === 'Established') {
    hoverText.push(
      <p key="outgoing">
        {showRam
          ? `TotalMemoryRecived: ${bytesToGB(cluster.TotalMemoryRecived)} GB`
          : `TotalCpusOffered: ${cluster.TotalCpusRecived} MilliCores`}
      </p>
    );
  }
  hoverText.push(
    <p key="latency">
      {`Latency: ${cluster.Latency.value}`}
    </p>
  );

  return (
    <Container>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip
            id={`tooltip-top`}
            style={{
              background: 'Black',
            }}
          >
            {hoverText}
          </Tooltip>
        }
      >
        <Container className="overflow-hidden d-flex flex-column justify-content-center align-items-center">
          {cluster.name.charAt(0).toUpperCase() + cluster.name.slice(1)}
          {cluster.networking !== '' ? (
            <BsCircleFill
              size={5 * size}
              color={
                cluster.incomingPeering !== 'Established'
                  ? '#8FBC8F'
                  : cluster.outgoingPeering !== 'Established'
                  ? '#CB3234'
                  : '#FF7514'
              }
            />
          ) : (
            <GrCloudComputer size={80} id={cluster.name} />
          )}
        </Container>
      </OverlayTrigger>
    </Container>
  );
};

export default ClusterBubbleChart;
