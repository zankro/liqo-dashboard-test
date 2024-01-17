import { ForeignCluster } from '../../api/types';
import { Container, Row, Col } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Offloading from '../Offloading/Offloading';
import Incoming from '../Incoming/Incoming';
import FrecceContainer from '../FrecceContainer/FrecceContainer';
import './LiqoNavTabs.css';
import { useXarrow } from 'react-xarrows';

export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  showRam: boolean;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function LiqoNavTabs(props: IClusterList) {
  const { clusters, refs, showRam } = props;
  const localCluster = clusters.local[0];
  return (
    <Tabs
      defaultActiveKey="offloading"
      id="uncontrolled-tab-example"
      className="mb-3 vcenter"
      fill
      style={{
        width: '100%',
        borderRadius: '0px',
      }}
    >
      <Tab eventKey="offloading" title="Offloading">
        <Offloading showRam={showRam} clusters={clusters} refs={refs} />
      </Tab>
      <Tab eventKey="map" title="Map" onClick={()=>useXarrow()}>
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
      </Tab>
      <Tab eventKey="incoming" title="Incoming">
        <Incoming clusters={clusters} refs={refs} />
      </Tab>
    </Tabs>
  );
}

export default LiqoNavTabs;
