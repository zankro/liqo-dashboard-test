import { ForeignCluster } from './types';

function getPeerings(): Promise<{ [key: string]: ForeignCluster[] }> {
const backend_address = process.env.REACT_APP_BACKEND_ADDRESS;
const backend_port = process.env.REACT_APP_BACKEND_PORT;
console.log(`http://${backend_address}:${backend_port}/api/foreign_clusters`);
  return get<{ [key: string]: ForeignCluster[] }>(
    `http://${backend_address}:${backend_port}/api/foreign_clusters`
  )
    .then((clusters: { [key: string]: ForeignCluster[] }) => {
      return clusters;
    })
    .catch(err => {
      console.error('Error fetching the clusters');
      throw Error(`Error fetching the clusters: ${err}`);
    });
}

function get<T>(url: string): Promise<T> {
  return fetch(url).then(res => {
    if (!res.ok) {
      throw Error(`Cannot retrieve from ${url}`);
    }

    return res.json() as Promise<T>;
  });
}

const API = { getPeerings };
export default API;
