import { Container, Navbar } from 'react-bootstrap';
import Logo from '../../images/logo.svg';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineClose } from 'react-icons/ai';
import { useMediaQuery } from 'react-responsive';
import ReactGA from 'react-ga';

import { ForeignCluster } from '../../api/types';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Offloading from '../Offloading/Offloading';

export interface IClusterList {
    clusters: ForeignCluster[];
    refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  }

function LiqoNavTabs(props: IClusterList) {
    const {clusters, refs} = props;
    console.log(clusters)

    return (
      <Tabs 
        defaultActiveKey="offloading"
        id="uncontrolled-tab-example"
        className="mb-3 vcenter"
        fill
      >
        <Tab eventKey="offloading" title="Offloading">
          <Offloading clusters={clusters} refs={refs}/>
        </Tab>
        <Tab eventKey="incoming" title="Incoming">
          {/* <Incoming /> */}
        </Tab>
      </Tabs>
    );
  }
  

export default LiqoNavTabs;