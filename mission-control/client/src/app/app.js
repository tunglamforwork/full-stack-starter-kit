import Axios from 'axios';

// components
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute, AuthProvider } from './auth';
import { View } from 'components/lib';
import { NotFound } from 'views/404';
import Settings from 'settings';

// tailwind css
import '../css/output.css';

const routes = [

  ...require('routes').default,
  ...require('routes/setup').default,

]

export default function App(props){

  const user = JSON.parse(localStorage.getItem('user'));
  Axios.defaults.baseURL = Settings[process.env.NODE_ENV].server_url || 'http://localhost:5001';

  if (user?.token){

    // add auth token to api header calls
    Axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.token;

  }

  // render the routes
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          { routes.map(route => {

            return (
              <Route 
                key={ route.path } 
                path={ route.path }
                element={ 
                  
                  route.permission ? 
                    <PrivateRoute permission={ route.permission }>
                      <View display={ route.view } layout={ route.layout } title={ route.title }/>
                    </PrivateRoute> :
                    <View display={ route.view } layout={ route.layout } title={ route.title  }/>

                }
              />
            )
            })}

            { /* 404 */}
            <Route path='*' element={ <View display={ NotFound } layout='home' title='404 Not Found' /> }/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
