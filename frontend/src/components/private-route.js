import React from 'react';
import { Route } from 'react-router-dom';

const PrivateRoute = ({
  trueComponent,
  falseComponent,
  decisionFunc,
  ...rest
}) => (
  <Route {...rest} render={decisionFunc() ? trueComponent : falseComponent} />
);

export default PrivateRoute;
