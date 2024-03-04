import { ForeignCluster } from '../../api/types';
import { Container, Row, Col } from 'react-bootstrap';
import FrecceContainer from './FrecceContainer';

export interface LayoutFrecceContainerProps {
  clusters: { [key: string]: ForeignCluster[] };
  showRam: boolean;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function LayoutFrecceContainer(props : LayoutFrecceContainerProps) {
    const { clusters, refs, showRam } = props;
    const localCluster = clusters.local[0];
    return (<Container
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
            <h2>Stato dei collegamenti</h2>

          </Container>
          <Row className="align-items-center mb-2">
            <Col
              xs="auto"
              style={{
                backgroundColor: '#8FBC8F',
                width: '20px',
                height: '20px',
              }}
            ></Col>
            <Col>Offloading only</Col>
          </Row>
          <Row className="align-items-center mb-2">
            <Col
              xs="auto"
              style={{
                backgroundColor: '#CB3234',
                width: '20px',
                height: '20px',
              }}
            ></Col>
            <Col>Incoming only</Col>
          </Row>
          <Row className="align-items-center mb-2">
            <Col
              xs="auto"
              style={{
                backgroundColor: '#FF7514',
                width: '20px',
                height: '20px',
              }}
            ></Col>
            <Col>Incoming and offloading</Col>
          </Row>
        </Container>
        <FrecceContainer
          showRam={showRam}
          localCluster={localCluster}
          remoteClusters={clusters.remote}
        />
        </Container>
    );
}
export default LayoutFrecceContainer;