import { ForeignCluster } from './types';

function getPeerings(): Promise<Array<ForeignCluster>> {

  console.log('prova API')

  return get<Array<ForeignCluster>>(
      'http://localhost:8089/api/foreign_clusters'
  )

    .then((clusters: Array<ForeignCluster>) => clusters)
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