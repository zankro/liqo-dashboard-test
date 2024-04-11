import LiqoNavbar from './components/LiqoNavbar/LiqoNavbar';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
export interface LayoutProps {
  metric: String;
  setMetric: (metric: String) => void;
  loading: boolean;
}

function Layout(props: LayoutProps) {
  const { metric, setMetric, loading } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LiqoNavbar metric={metric} setMetric={setMetric} />
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          Loading...
          <img height={50} width={50} src={'/LoadingGif.gif'} alt="loading" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Outlet />
        </motion.div>
      )}
    </div>
  );
}

export default Layout;
