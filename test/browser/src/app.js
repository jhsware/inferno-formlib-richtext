import Inferno from 'inferno'
import Component from 'inferno-component'
require('inferno-devtools')
import { Router, Route, Redirect, IndexRoute, Link } from 'inferno-router'
import createBrowserHistory from 'history/createBrowserHistory'

import BasicPage from './BasicPage'

class AppLayout extends Component {
  render () {
    return (
        <div className="Content">
          {this.props.children}
        </div>
    )
  }
}

if (typeof window !== 'undefined') {
  const browserHistory = createBrowserHistory()

  const appRoutes = (
    <Router history={ browserHistory }>
      <Route path="/inferno-formlib-richtext" component={ AppLayout }>
        <IndexRoute component={ BasicPage } />
      </Route>
      <Redirect from="/*" to="/inferno-formlib-richtext" />
    </Router>
  )
  Inferno.render(appRoutes, document.getElementById('app'))
}