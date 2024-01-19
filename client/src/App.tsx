import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForeignCluster } from './api/types';
import DefaultLayout from './DefaultLayout';
import API from './api/API';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import LayoutFrecceContainer from './components/FrecceContainer';
import NotFoundPage from './NotFoundPage';
import Offloading from './components/Offloading';
import Incoming from './components/Incoming';
import { capitalizeFirstLetter } from './utils/utils';

function App() {
  const [clusters, setClusters] = useState<{ [key: string]: ForeignCluster[] }>(
    {}
  );
  const [currentCluster, setCurrentCluster] = useState<ForeignCluster>();
  const [init, setInit] = useState<Boolean>(true);
  const [showRam, setShowRam] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true); // Aggiungi questa linea
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  const fetchAndSetCluster = useCallback(() => {
    API.getPeerings().then(fetchedClusters => {
      fetchedClusters.local[0].name = capitalizeFirstLetter(fetchedClusters.local[0].name)
      fetchedClusters.remote.forEach(cluster => {
        cluster.name = capitalizeFirstLetter(cluster.name)
      }) 
      setClusters(fetchedClusters);
      if (Object.keys(fetchedClusters).length > 0) {
        if (!currentCluster) {
          setCurrentCluster(fetchedClusters.local[0]);
        }
      }
      setIsLoading(false); // Aggiungi questa linea
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


  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
            <Route
              path="/"
              element={
                <DefaultLayout loading= {isLoading} showRam={showRam} setShowRam={setShowRam} />
              }
            >
              <Route
            path="/"
            element={
              <LayoutFrecceContainer
                clusters={clusters}
                showRam={showRam}
                refs={refs}
              />
            }
          />
          <Route
            path="Offloading"
            element={
              <Offloading showRam={showRam} clusters={clusters} refs={refs} />
            }
          />
          <Route
            path="Incoming"
            element={<Incoming showRam={showRam} clusters={clusters} refs={refs} />}
          />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;