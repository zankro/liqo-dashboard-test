import { Container, Navbar } from 'react-bootstrap';
import Logo from '../../images/logo.svg';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineClose } from 'react-icons/ai';
import { useMediaQuery } from 'react-responsive';
import ReactGA from 'react-ga';

import { ForeignCluster } from '../../api/types';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Plot from 'react-plotly.js';

export interface IClusterList {
    clusters: ForeignCluster[];
    refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}




function Offloading(props: IClusterList) {
    const { clusters, refs } = props;
    console.log(clusters);

    // const local: string = clusters[0].name;

    // console.log(clusters[0].name);
    // console.log(local);


    // return (
    //     <>
    //         <div>
    //             {
    //                 clusters.map(c => {
    //                     console.log(c.name)
    //                     return (
    //                         <h1 key={c.name}>
    //                             {c.name}
    //                         </h1>
    //                     )
    //                 })
    //             }
    //         </div>
    //     </>
    // );

    
    if(clusters[0] != null) {
        console.log(clusters[0].name)
        const labels = clusters.map(c => c.name)
        console.log(labels)
        console.log(clusters.find(c => c.name == 'Local Cluster'))
        const y = clusters[0].localResources[0].NodetotalCpus;
        const y2 = clusters[0].localResources[0].NodetotalMemory;
        return(
            // <Plot
            //   data={[
            //     {
            //     //   labels: labels,
            //     //   parents: ["", labels[1], labels[1]],
            //     // labels: ["Eve", clusters[0].name, "Seth", "Enos", "Noam", "Abel", "Awan", "Enoch", "Azura"],
            //     // parents: ["", "Seth", "Eve", "Seth", "Seth", "Eve", "Eve", "Awan", "Eve" ],

            //     labels: [clusters[0].name, clusters[1].name, clusters[2].name],
            //     parents: ["", clusters[0].name, clusters[1].name],
            //       type: 'treemap',
            //     //   mode: 'lines+markers',
            //     //   marker: {color: 'red'},
            //     }
            //   ]}
            //   layout={ {width: 800, height: 800, title: 'A Fancy Plot'} }
            // />

            <>
            {clusters.map((cluster, i) => (
                cluster.outgoingPeering === 'Established' ? (
                <>
                <Plot
                    key={i}
                    data={[
                    {
                        x: ['Memory'],
                        y: [cluster.TotalUsedMemoryRecived],
                        type: "bar"
                    },
                    {
                        x: ['Memory'],
                        y: [cluster.TotalMemoryRecived],
                        type: "bar"
                    }
                    ]}
                    layout={ {width: 500, height: 500, title: cluster.name, barmode: "stack", yaxis: {range: [0,8000000]} } }
                />

                <Plot
                key={i}
                data={[
                {
                    x: ['CPU'],
                    y: [cluster.TotalUsedCpusRecived],
                    type: "bar"
                },
                {
                    x: ['CPU'],
                    y: [cluster.TotalCpusRecived],
                    type: "bar"
                }
                ]}
                layout={ {width: 500, height: 500, title: cluster.name, barmode: "stack", yaxis: {range: [0,cluster.TotalCpusRecived]} } }
                />
                </>
                ) : <></>
            ))}
            </>

            
          );
    } 

    return(
        <div>
            
        </div>
    )

  }
  

export default Offloading;