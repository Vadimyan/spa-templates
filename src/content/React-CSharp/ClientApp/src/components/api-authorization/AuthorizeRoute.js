import React from 'react';
import { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { ApplicationPaths, QueryParameterNames } from './ApiAuthorizationConstants';
import authService from './AuthorizeService';

export function AuthorizeRoute(props) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const populateAuthenticationState = async () => {
      const authenticated = await authService.isAuthenticated();
      setReady(true);
      setAuthenticated(authenticated);
    };

    const authenticationChanged = async () => {
      setReady(false);
      setAuthenticated(false);
      await populateAuthenticationState();
    };

    const subscription = authService.subscribe(() => authenticationChanged());
    populateAuthenticationState();
    return () => authService.unsubscribe(subscription);
  }, [])

  const link = document.createElement("a");
  link.href = props.path;
  const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
  const redirectUrl = `${ApplicationPaths.Login}?${QueryParameterNames.ReturnUrl}=${encodeURIComponent(returnUrl)}`
  if (!ready) {
    return <div></div>;
  } else {
    const { component: Component, ...rest } = props;
    return <Route {...rest}
                  render={(props) => {
                    if (authenticated) {
                      return <Component {...props} />
                    } else {
                      return <Redirect to={redirectUrl} />
                    }
                  }} />
  }
}