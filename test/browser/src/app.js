import Inferno from 'inferno'
import Component from 'inferno-component'
import { Router, Route, Redirect, IndexRoute, Link } from 'inferno-router'
import createBrowserHistory from 'history/createBrowserHistory'

import Button from 'inferno-bootstrap/lib/Button'

import Nav from 'inferno-bootstrap/lib/Navigation/Nav'
import NavItem from 'inferno-bootstrap/lib/Navigation/NavItem'

import BasicPage from './BasicPage'
import ViewPage from './ViewPage'

function NavLink (props) {
  return (
    <Link activeClassName="active" className="nav-link" to={props.to}>{props.children}</Link>
  )
}

class AppLayout extends Component {
  render () {
    return (
      <div className="Content">
        <Nav>
          <NavItem>
            <NavLink to="/inferno-formlib-richtext">Edit Page</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/inferno-formlib-richtext/view">View Page</NavLink>
          </NavItem>
        </Nav>
        {this.props.children}
      </div>
    )
  }
}

if (typeof window !== 'undefined') {
  require('inferno-devtools')
  const browserHistory = createBrowserHistory()

  const appRoutes = (
    <Router history={ browserHistory }>
      <Route path="/inferno-formlib-richtext" component={ AppLayout }>
        <IndexRoute component={ BasicPage } />
        <Route path="/view" component={ ViewPage } />
      </Route>
      <Redirect from="/*" to="/inferno-formlib-richtext" />
    </Router>
  )
  Inferno.render(appRoutes, document.getElementById('app'))
}