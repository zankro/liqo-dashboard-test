import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ForeignCluster } from './api/types';
import API from './api/API';
import './App.css';
import LiqoNavbar from './components/Navbar/Navbar';
import LiqoNavTabs from './components/LiqoNavTabs/LiqoNavTabs';

function App() {
  const [clusters, setClusters] = useState<{ [key: string]: ForeignCluster[] }>(
    {}
  );
  const [currentCluster, setCurrentCluster] = useState<ForeignCluster>();
  const [init, setInit] = useState<Boolean>(true);
  const [showRam, setShowRam] = useState<boolean>(true);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const fetchAndSetCluster = useCallback(() => {
    API.getPeerings().then(fetchedClusters => {
      setClusters(fetchedClusters);
      if (Object.keys(fetchedClusters).length > 0) {
        if (!currentCluster) {
          setCurrentCluster(fetchedClusters.local[0]);
        }
      }
    });
  }, [currentCluster]);

  useEffect(() => {
    if (init) {
      fetchAndSetCluster();
      setInit(false);
    }
    const interval = setInterval(() => {
      setInit(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchAndSetCluster, init]);

  useEffect(() => {
    refs.current = refs.current.slice(0, Object.keys(clusters).length);
  }, [Object.keys(clusters).length]);

  useEffect(() => {
    const onScroll = () => {
      const index: number = refs.current.findIndex(ref => {
        const top: number = ref?.getBoundingClientRect().top || 0;
        return top < 300 && top > -300;
      });
      if (
        index !== -1 &&
        clusters[Object.keys(clusters)[index]][0] !== currentCluster
      ) {
        setCurrentCluster(clusters[Object.keys(clusters)[index]][0]);
      }
    };
    window.addEventListener('scroll', onScroll);
  }, [currentCluster, clusters]);

  return Object.keys(clusters).length > 0 ? (
    <div className="prevent-select">
      <LiqoNavbar showRam={showRam} setShowRam={setShowRam} />
      <Container fluid={true} className="navbar-padding">
        <Row>
          {/*<Col md={2}>
            <Sidebar
              onClusterClick={onClusterClick}
              currentClusterName={currentCluster?.name}
              clustersNames={Object.keys(clusters)}
              collapsed={!isHamburgerOpened}
            />
      </Col>*/}
          <Col /*md={10}*/ className="pb-4 myTabs">
            <LiqoNavTabs showRam={showRam} clusters={clusters} refs={refs} />
            {/* <ClusterList clusters={Object.values(clusters).flat()} refs={refs} /> */}
          </Col>
        </Row>
      </Container>
    </div>
  ) : (
    <div></div>
  );
}

export default App;
