import { ForeignCluster } from '../../api/types';
import { Container, Row, Col } from 'react-bootstrap';
import FrecceContainer from './FrecceContainer';

export interface LayoutFrecceContainerProps {
  clusters: { [key: string]: ForeignCluster[] };
  metric: String;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function LayoutFrecceContainer(props: LayoutFrecceContainerProps) {
  const { clusters, refs, metric } = props;
  const localCluster = clusters.local[0];
  return (
    <Container
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Container>
        <Container className="center">
          <h2>Peering Status</h2>
        </Container>
      </Container>
      <FrecceContainer
        metric={metric}
        localCluster={localCluster}
        remoteClusters={clusters.remote}
      />
    </Container>
  );
}
export default LayoutFrecceContainer;
