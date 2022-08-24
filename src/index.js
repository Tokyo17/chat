import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ApolloClient,InMemoryCache,ApolloProvider} from "@apollo/client";
import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws'

const httpLink=new HttpLink({
  uri:'https://optimum-corgi-31.hasura.app/v1/graphql',
  // cache:new InMemoryCache(),
  headers: {"x-hasura-admin-secret":'dKHsPm53cqnlHZuM3TpUiqgGsVxicG36KEDxAhw2cUeKfOB5R4TS2ab8vRkUaLy9'}
})

// const wsLink = new WebSocketLink({
//   uri: 'wss://optimum-corgi-31.hasura.app/v1/graphql',
//   options: {
//     reconnect: true,
//     connectionParams:{
//     	headers: {"x-hasura-admin-secret":'dKHsPm53cqnlHZuM3TpUiqgGsVxicG36KEDxAhw2cUeKfOB5R4TS2ab8vRkUaLy9'}
//     }
//   }
// });
const wsLink = new GraphQLWsLink(createClient({
  url:'wss://optimum-corgi-31.hasura.app/v1/graphql',
  // cache:new InMemoryCache(),
  connectionParams:{ 

  headers:{"x-hasura-admin-secret":'dKHsPm53cqnlHZuM3TpUiqgGsVxicG36KEDxAhw2cUeKfOB5R4TS2ab8vRkUaLy9'}}
  // headers: {"x-hasura-admin-secret":'dKHsPm53cqnlHZuM3TpUiqgGsVxicG36KEDxAhw2cUeKfOB5R4TS2ab8vRkUaLy9'}
}));
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  headers: {"x-hasura-admin-secret":'dKHsPm53cqnlHZuM3TpUiqgGsVxicG36KEDxAhw2cUeKfOB5R4TS2ab8vRkUaLy9'}
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// C:\Program Files\mosquitto>mosquitto_sub -h test.mosquitto.org -t "justcoba177"
// // -v