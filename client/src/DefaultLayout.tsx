import LiqoNavbar from './components/LiqoNavbar/LiqoNavbar';
import { Outlet } from 'react-router-dom';
import {motion} from 'framer-motion'
export interface LayoutProps {
  showRam: boolean;
  setShowRam: (showRam: boolean) => void;
  loading: boolean;
}

function Layout(props: LayoutProps) {
  const { showRam, setShowRam,loading } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LiqoNavbar showRam={showRam} setShowRam={setShowRam} />
      {loading?<div>
            <img src={'/LoadingGif.gif'} alt="loading" />
            Loading...
          </div>:  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  ><Outlet /></motion.div>}
    </div>
  );
}

export default Layout;
