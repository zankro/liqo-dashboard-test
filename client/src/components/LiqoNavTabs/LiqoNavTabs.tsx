import { ForeignCluster } from '../../api/types';
import { Container }  from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Offloading from '../Offloading/Offloading';
import FrecceContainer  from '../FrecceContainer/FrecceContainer';
export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function LiqoNavTabs(props: IClusterList) {
  const { clusters, refs } = props;
  console.log(clusters);
  const localCluster = clusters.local[0];
  return (
    <Tabs
      defaultActiveKey="offloading"
      id="uncontrolled-tab-example"
      className="mb-3 vcenter"
      fill
    >
      <Tab eventKey="offloading" title="Offloading">
        <Offloading clusters={clusters} refs={refs} />
      </Tab>
      <Tab eventKey="map" title="Map">
        <Container
          style={{
            marginTop: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
            <FrecceContainer
                        localCluster={localCluster}
                        remoteClusters={clusters.remote}
                      />
          </Container>
      </Tab>
      <Tab eventKey="incoming" title="Incoming">
        {/* <Incoming /> */}
      </Tab>
    </Tabs>
  );
}

export default LiqoNavTabs;
