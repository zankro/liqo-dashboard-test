import { ForeignCluster } from '../../api/types';
import { Container }  from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Offloading from '../Offloading/Offloading';
import Incoming from '../Incoming/Incoming';
import FrecceContainer  from '../FrecceContainer/FrecceContainer';
import './LiqoNavTabs.css';
export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function LiqoNavTabs(props: IClusterList) {
  const { clusters, refs } = props;
  console.log(clusters);
  const localCluster = clusters.local[0];
  console.log(clusters.remote);
  return (
    <Tabs
      defaultActiveKey="offloading"
      id="uncontrolled-tab-example"
      className="mb-3 vcenter"
      fill
      style={
        {
          width:"100%",
          borderRadius: "0px"
        }
      }
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
        <Incoming clusters={clusters} refs={refs}/>
      </Tab>
    </Tabs>
  );
}

export default LiqoNavTabs;
