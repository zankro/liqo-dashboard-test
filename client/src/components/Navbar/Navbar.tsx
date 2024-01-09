import { Container, Navbar } from 'react-bootstrap';
import Logo from '../../images/logo.svg';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineClose } from 'react-icons/ai';
import { useMediaQuery } from 'react-responsive';
import ReactGA from 'react-ga';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const win = window as any;

export interface ILiqoNavbar {
  onHamburgerClick: () => void;
  isHamburgerOpened: Boolean;
}

function LiqoNavbar(props: ILiqoNavbar) {
  const { onHamburgerClick, isHamburgerOpened } = props;
  const isSingleColumn = useMediaQuery({ query: '(max-width: 768px)' });

  if (win._env_ && win._env_.GOOGLE_ANALYTICS_TRACKING_ID) {
    ReactGA.initialize((window as any)._env_.GOOGLE_ANALYTICS_TRACKING_ID);
    ReactGA.pageview(win.location.pathname);
  }

  return (
    
      <div>
        <Navbar bg="dark" variant="dark" fixed="top">
          <Container fluid={true}>
            {!isSingleColumn ? (
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
            ) : (
              <Navbar.Brand
                onClick={(event: any) => {
                  event.preventDefault();
                  onHamburgerClick();
                }}
              >
                {!isHamburgerOpened ? <GiHamburgerMenu /> : <AiOutlineClose />}
              </Navbar.Brand>
            )}
          </Container>
        </Navbar>
      </div>
    
  );
}

export default LiqoNavbar;