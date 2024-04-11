import { Container, Navbar, Dropdown } from 'react-bootstrap';
import Logo from '../../images/logo.svg';
import ReactGA from 'react-ga';
import 'react-toggle/style.css'; // for ES6 modules
import { FiCpu } from 'react-icons/fi';
import { CgSmartphoneRam } from 'react-icons/cg';
import './LiqoNavbar.css';
import { Link, useLocation } from 'react-router-dom';
const win = window as any;

export interface ILiqoNavbar {
  metric: String;
  setMetric: Function;
}

function LiqoNavbar(props: ILiqoNavbar) {
  const { metric, setMetric } = props;
  const location = useLocation();
  if (win._env_ && win._env_.GOOGLE_ANALYTICS_TRACKING_ID) {
    ReactGA.initialize((window as any)._env_.GOOGLE_ANALYTICS_TRACKING_ID);
    ReactGA.pageview(win.location.pathname);
  }

  const handleSelect = (eventKey: any) => setMetric(eventKey);

  return (
    <Navbar bg="dark" variant="dark">
      <Container
        fluid={true}
        className="greaterContainer"
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container
          fluid={true}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
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
            <Dropdown
              className="custom-dropdown-container"
              onSelect={handleSelect}
            >
              <Dropdown.Toggle className="custom-dropdown" id="dropdown-basic">
                {metric}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {metric !== 'Ram' ? (
                  <Dropdown.Item className="custom-dropdown" eventKey="Ram">
                    Ram
                  </Dropdown.Item>
                ) : (
                  ''
                )}
                {metric !== 'CPU' ? (
                  <Dropdown.Item className="custom-dropdown" eventKey="CPU">
                    CPU
                  </Dropdown.Item>
                ) : (
                  ''
                )}
                {metric !== 'GPU' ? (
                  <Dropdown.Item className="custom-dropdown" eventKey="GPU">
                    GPU
                  </Dropdown.Item>
                ) : (
                  ''
                )}
              </Dropdown.Menu>
            </Dropdown>
          </label>
        </Container>
        <Container className="customTab">
          <Link to="/offloading" className="navTabs">
            <label
              style={{
                color:
                  location.pathname === '/offloading'
                    ? '#395cb3'
                    : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
              }}
            >
              Offloading
            </label>
          </Link>
          <Link
            to="/"
            className="navTabs"
            style={{
              color:
                location.pathname === '/' ? '#395cb3' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <label style={{ cursor: 'pointer' }}>Map</label>
          </Link>
          <Link
            to="/incoming"
            className="navTabs"
            style={{
              color:
                location.pathname === '/incoming'
                  ? '#395cb3'
                  : 'rgba(255,255,255,0.5)',
            }}
          >
            <label style={{ cursor: 'pointer' }}>Incoming</label>
          </Link>
        </Container>
      </Container>
    </Navbar>
  );
}

export default LiqoNavbar;
