import './App.css';
import React, { useState, useEffect } from "react";
import Pages from './pages';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { auth } from "./firebase";
import { signOut } from 'firebase/auth';

function App() {

  const endpointURI = "192.168.2.105:4008/graphql";

  const [loginToken, setLoginToken] = useState(null)

  const httpLink = new HttpLink({
    uri: `http://${endpointURI}`
  })

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // const token = JSON.parse(localStorage.getItem('access_token'));
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: loginToken ? `${loginToken}` : "",
      }
    }
  });

  const client = new ApolloClient({
    // link: authLink.concat(upLoadLink)?.concat(logoutLink),
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache()
  });

  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      setLoginToken(user?.accessToken)
      // ...
    }
  })

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setLoginToken(null)
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  }

  // useEffect(()=>{
  //   setTimeout(()=>{
  //     setLoginToken("Token Bearer dfsdfsfasdfasfsdf")
  //   },5000)
  // },[])

  return (
    <div className="App">
      <ApolloProvider client={client}>
        <Router>
          <Routes>
            <Route path='/:id'>
              {loginToken ?
                <Route index element={<Pages.FaceDetectionPage />} />
                :
                <Route index element={<Pages.Login />} />
              }
            </Route>
            <Route path='/success'>
              <Route index element={<Pages.SuccessPage />} />
            </Route>
          </Routes>
        </Router>
        
        {
          loginToken ? <button onClick={handleLogout} className="btn-logout">
            Logout
          </button> : null
        }

      </ApolloProvider>
    </div>
  );
}

export default App;
