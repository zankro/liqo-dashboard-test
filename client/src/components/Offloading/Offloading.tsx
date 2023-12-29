import { Container, Navbar, Button, ButtonGroup } from 'react-bootstrap';
import Logo from '../../images/logo.svg';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineClose } from 'react-icons/ai';
import { useMediaQuery } from 'react-responsive';
import ReactGA from 'react-ga';
import './Offloading.css';
import { useState } from "react";

import { ForeignCluster } from '../../api/types';
import {
    calculatePercentage,
    getHighestUnit,
    noResourcesMessage,
    textOnChart,
    bytesToGB,
  } from '../../utils/utils';

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
    const [showRam, setShowRam] = useState(true);

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
            <>
                <div className='center'>
                    <Button variant="primary" onClick={() => {setShowRam(!showRam)}}>
                        Mostra {showRam ? "CPU" : "RAM"} 
                    </Button>
                </div>

                {clusters.map((cluster, i) => (

                    cluster.outgoingPeering === 'Established' ? (
                    <>
                        {console.log(cluster.Latency)}
                        {showRam ? 
                            <Plot
                                key={i}
                                data={[
                                {
                                    x: ['Memory (GB)'],
                                    y: [bytesToGB(cluster.TotalUsedMemoryRecived)],
                                    type: "bar"
                                },
                                {
                                    x: ['Memory (GB)'],
                                    y: [bytesToGB(cluster.TotalMemoryRecived)],
                                    type: "bar"
                                }
                                ]}
                                layout={ {width: 500, height: 500, title: cluster.name + ' (Latency: ' + cluster.Latency.value + ')', barmode: "stack", yaxis: {range: [0,bytesToGB(cluster.TotalMemoryRecived)]} } }
                                // config={{staticPlot: true}}
                            /> :

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
                            layout={ {width: 500, height: 500, title: cluster.name + ' (Latency: ' + cluster.Latency.value + ')', barmode: "stack", yaxis: {range: [0,cluster.TotalCpusRecived]} } }
                            />
                        }
                    </>
                ) : <></>
                ))}
            </>

            
          );
    } 
}
  

export default Offloading;