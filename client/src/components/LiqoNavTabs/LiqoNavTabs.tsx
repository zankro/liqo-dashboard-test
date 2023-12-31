import { ForeignCluster } from '../../api/types';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Offloading from '../Offloading/Offloading';

export interface IClusterList {
  clusters: { [key: string]: ForeignCluster[] };
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function LiqoNavTabs(props: IClusterList) {
  const { clusters, refs } = props;
  console.log(clusters);

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
      <Tab eventKey="incoming" title="Incoming">
        {/* <Incoming /> */}
      </Tab>
    </Tabs>
  );
}

export default LiqoNavTabs;
