import React from 'react';
import Plot from 'react-plotly.js';
import { bytesToGB } from '../../../utils/utils';
import { PodResourceMetrics } from '../../../api/types';
import { ForeignCluster } from '../../../api/types';

interface Props {
    cluster: ForeignCluster;
    showRam: boolean;
}

const PodsHorizontalBarChart: React.FC<Props> = ({ cluster, showRam }) => {
    const xData = cluster.incomingResources.map((pod: PodResourceMetrics) => showRam ? bytesToGB(pod.PodTotalMemory)*1024 : pod.PodTotalCpus);
    const yData = cluster.incomingResources.map((pod: PodResourceMetrics) => pod.name);


    return (
        <Plot
            data={[
            {
                x: xData,
                y: yData,
                type: 'bar',
                orientation: 'h',
            }
        ]}
            layout={{
                width: 400,
                height: 400,
                title: showRam ? `${cluster.name} Pod's Memory in MB` : `${cluster.name} Pod's CPUs in milliCores`,
                yaxis: {
                    automargin: true,
                },
            }}
        />
    );
};

export default PodsHorizontalBarChart;