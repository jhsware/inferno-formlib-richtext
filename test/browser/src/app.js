import { Component, render } from 'inferno'
import { BrowserRouter, Switch, Route, Redirect, Link } from 'inferno-router'

import Button from 'inferno-bootstrap/src/Button'

import Nav from 'inferno-bootstrap/src/Navigation/Nav'
import NavItem from 'inferno-bootstrap/src/Navigation/NavItem'

import BasicPage from './BasicPage'
import ViewPage from './ViewPage'

function NavLink (props) {
  return (
    <Link activeClassName="active" className="nav-link" to={props.to}>{props.children}</Link>
  )
}

function Content ({ match }) {
  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}`} component={ BasicPage } />
        <Route exact path={`${match.path}/view`} component={ ViewPage } />
        <Redirect to="/inferno-formlib-richtext" />
      </Switch>
    </div>
  )
}

class App extends Component {
  render () {
    return (
      <div className="Content">
        <Nav className="MenuNavigation">
          <NavItem>
            <NavLink to="/inferno-formlib-richtext">Edit Page</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/inferno-formlib-richtext/view">View Page</NavLink>
          </NavItem>
        </Nav>
        <Switch>
          <Route path="/inferno-formlib-richtext" component={ Content } />
          <Redirect to="/inferno-formlib-richtext" />
        </Switch>
      </div>
    )
  }
}

if (typeof window !== 'undefined') {
  // require('inferno-devtools')

  render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('app'))
}