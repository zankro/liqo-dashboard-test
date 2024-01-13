import { Container, Navbar } from 'react-bootstrap';
import Logo from '../../images/logo.svg';
import ReactGA from 'react-ga';
import Toggle from 'react-toggle';
import 'react-toggle/style.css'; // for ES6 modules
import { FiCpu } from 'react-icons/fi';
import { CgSmartphoneRam } from 'react-icons/cg';
import './Navbar.css';
const win = window as any;

export interface ILiqoNavbar {
  showRam: Boolean;
  setShowRam: Function;
}

function LiqoNavbar(props: ILiqoNavbar) {
  const { showRam, setShowRam } = props;
  if (win._env_ && win._env_.GOOGLE_ANALYTICS_TRACKING_ID) {
    ReactGA.initialize((window as any)._env_.GOOGLE_ANALYTICS_TRACKING_ID);
    ReactGA.pageview(win.location.pathname);
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark" fixed="top">
        <Container fluid={true}>
          <Navbar.Brand>
            <img
              alt=""
              src={Logo}
              width="110"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Public peering dashboard
          </Navbar.Brand>
          <label className="d-flex flex-row justify-content-between align-items-center">
            <span
              style={{
                color: 'white',
              }}
            >
              {showRam ? 'Mostra CPU' : 'Mostra RAM'}
            </span>
            <Toggle
              checked={Boolean(showRam)}
              className="custom-toggle"
              icons={{
                checked: <CgSmartphoneRam />,
                unchecked: <FiCpu />,
              }}
              onChange={() => setShowRam((oldValue: boolean) => !oldValue)}
            />
          </label>
        </Container>
      </Navbar>
    </div>
  );
}

export default LiqoNavbar;
