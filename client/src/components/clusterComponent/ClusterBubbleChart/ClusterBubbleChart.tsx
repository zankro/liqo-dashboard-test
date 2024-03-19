import React from 'react';
import { ForeignCluster } from '../../../api/types';
import { BsCircleFill } from 'react-icons/bs';
import { Container, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { GrCloudComputer } from 'react-icons/gr';
import { bytesToGB } from '../../../utils/utils';

interface ClusterBubbleChartProps {
  cluster: ForeignCluster;
  metric: String;
  type: String;
  clusterColor: string;
}

const ClusterBubbleChart: React.FC<ClusterBubbleChartProps> = ({
  cluster,
  metric,
  type,
  clusterColor,
}) => {
  const calculateSize = (cluster: ForeignCluster, metric: String) => {
    let value = 0;
    if (
      (cluster.incomingPeering === 'Established' && type === 'incoming') ||
      type === 'local'
    ) {
      value +=
        metric === 'Ram'
          ? bytesToGB(cluster.TotalMemoryOffered)
          : metric === 'CPU'
          ? cluster.TotalCpusOffered
          : 0;
    }
    if (
      (cluster.outgoingPeering === 'Established' && type === 'outgoing') ||
      type === 'local'
    ) {
      value +=
        metric === 'Ram'
          ? bytesToGB(cluster.TotalMemoryRecived)
          : metric === 'CPU'
          ? cluster.TotalCpusRecived
          : 0;
    }
    return value;
  };

  const size = calculateSize(cluster, metric);

  let hoverText = [
    <p key="name">
      {cluster.name.charAt(0).toUpperCase() + cluster.name.slice(1)}
    </p>,
  ];
  if (
    cluster.incomingPeering === 'Established' &&
    (type === 'incoming' || type === 'local')
  ) {
    hoverText.push(
      <p key="incoming">
        {metric === 'Ram'
          ? `TotalMemoryOffered: ${bytesToGB(cluster.TotalMemoryOffered)} GB`
          : metric === 'CPU'
          ? `TotalCpusOffered: ${cluster.TotalCpusOffered} MilliCores`
          : 'No value Found'}
      </p>
    );
  }
  if (
    cluster.outgoingPeering === 'Established' &&
    (type === 'outgoing' || type === 'local')
  ) {
    hoverText.push(
      <p key="outgoing">
        {metric === 'Ram'
          ? `TotalMemoryRecived: ${bytesToGB(cluster.TotalMemoryRecived)} GB`
          : metric === 'CPU'
          ? `TotalCpusOffered: ${cluster.TotalCpusRecived} MilliCores`
          : 'No value Found'}
      </p>
    );
  }
  if (cluster.Latency.value)
    hoverText.push(<p key="latency">{`Latency: ${cluster.Latency.value}`}</p>);

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
            <BsCircleFill size={5 * size} color={clusterColor} />
          ) : (
            <GrCloudComputer size={80} id={cluster.name} />
          )}
        </Container>
      </OverlayTrigger>
    </Container>
  );
};

export default ClusterBubbleChart;
