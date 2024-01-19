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
<div></div>
  );
}

export default LiqoNavTabs;
