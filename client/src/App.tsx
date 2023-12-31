import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ForeignCluster } from './api/types';
import API from './api/API';
import './App.css';
import LiqoNavbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import ClusterList from './components/clusterComponent/ClusterList';
import LiqoNavTabs from './components/LiqoNavTabs/LiqoNavTabs'

function App() {
  const [clusters, setClusters] = useState<{ [key: string]: ForeignCluster[] }>({});
  const [currentCluster, setCurrentCluster] = useState<ForeignCluster>();
  const [init, setInit] = useState<Boolean>(true);
  const [isHamburgerOpened, setHamburgerStatus] = useState<Boolean>(false);
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

  console.log(clusters);

  useEffect(() => {
    if (init) {
      fetchAndSetCluster();
      setInit(false);
    }
    const interval = setInterval(() => {
      setInit(true);
    }, 60000);
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
      if (index !== -1 && clusters[Object.keys(clusters)[index]][0] !== currentCluster) {
        setCurrentCluster(clusters[Object.keys(clusters)[index]][0]);
      }
    };
    window.addEventListener('scroll', onScroll);
  }, [currentCluster, clusters]);

  function onClusterClick(clusterName: string) {
    const clusterIndex = Object.keys(clusters).findIndex(
      (name: string) => name === clusterName
    );
    if (clusterIndex !== -1) {
      refs.current[clusterIndex]?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  return (
    Object.keys(clusters).length > 0 ? 
    <>
      <LiqoNavbar
        onHamburgerClick={() =>
          setHamburgerStatus((oldStatus: Boolean) => !oldStatus)
        }
        isHamburgerOpened={isHamburgerOpened}
      />
      <Container fluid={true} className="navbar-padding">
        <Row>
          <Col md={2}>
            <Sidebar
              onClusterClick={onClusterClick}
              currentClusterName={currentCluster?.name}
              clustersNames={Object.keys(clusters)}
              collapsed={!isHamburgerOpened}
            />
          </Col>
          <Col md={10} className="pb-4 myTabs">
            <LiqoNavTabs clusters={clusters} refs={refs} />
            {/* <ClusterList clusters={Object.values(clusters).flat()} refs={refs} /> */}
          </Col>
        </Row>
      </Container>
    </> :
    <div>

    </div>
  );
}


export default App;