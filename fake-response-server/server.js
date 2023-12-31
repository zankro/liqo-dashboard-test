const express = require('express');
const cors = require('cors');

corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
const app = express();
app.use(cors(corsOptions));
const fakeResponse = [
    {
      "name": "milan",
      "networking": "Established",
      "authentication": "Established",
      "outgoingPeering": "Established",
      "outgoingResources": null,
      "incomingPeering": "Established",
      "incomingResources": [],
      "age": "2023-12-23 17:44:05 +0100 CET",
      "TotalUsedCpusOffered": 0,
      "TotalUsedMemoryOffered": 0,
      "TotalUsedMemoryRecived": 7020544,
      "TotalUsedCpusRecived": 0,
      "TotalMemoryRecived": 14486000000,
      "TotalCpusRecived": 13.455,
      "Latency": {
        "value": "1ms",
        "timestamp": "2023-12-28T16:08:38Z"
      },
      "localResources": null
    },
    {
      "name": "snowy-river",
      "networking": "Established",
      "authentication": "Established",
      "outgoingPeering": "Established",
      "outgoingResources": null,
      "incomingPeering": "Established",
      "incomingResources": [],
      "age": "2023-12-23 17:53:49 +0100 CET",
      "TotalUsedCpusOffered": 0,
      "TotalUsedMemoryOffered": 0,
      "TotalUsedMemoryRecived": 0,
      "TotalUsedCpusRecived": 0,
      "TotalMemoryRecived": 7129000000,
      "TotalCpusRecived": 6.345,
      "Latency": {
        "value": "3ms",
        "timestamp": "2023-12-28T16:08:38Z"
      },
      "localResources": null
    },
    {
      "name": "Local Cluster",
      "networking": "",
      "authentication": "",
      "outgoingPeering": "",
      "outgoingResources": null,
      "incomingPeering": "",
      "incomingResources": null,
      "TotalUsedCpusOffered": 0,
      "TotalUsedMemoryOffered": 0,
      "TotalUsedMemoryRecived": 0,
      "TotalUsedCpusRecived": 0,
      "TotalMemoryRecived": 0,
      "TotalCpusRecived": 0,
      "Latency": {
        "timestamp": null
      },
      "localResources": [
        {
          "name": "rome-worker",
          "NodetotalCpus": 0,
          "NodetotalMemory": 6967296,
          "Pods": [
            {
              "name": "nginx-local",
              "containersResources": [
                {
                  "name": "nginx",
                  "ContainertotalMemory": 6967296,
                  "ContainertotalCpus": 0
                }
              ],
              "PodtotalMemory": 6967296,
              "PodtotalCpus": 0
            }
          ]
        }
      ]
    }
  ]

app.get('/api/foreign_clusters', (req, res) => {
  res.json(fakeResponse);
});

const PORT = 8089;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
