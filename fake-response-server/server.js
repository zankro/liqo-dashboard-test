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
    "local": [
      {
        "name": "Rome",
        "networking": "",
        "authentication": "",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "Established",
        "incomingResources": null,
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 75190272,
        "TotalCpusOffered": 55.53,
        "TotalMemoryOffered": 28457000000,
        "TotalUsedMemoryReceived": 37941248,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 21512000000,
        "TotalCpusReceived": 41.4,
        "clusterCpuUsage": 0,
        "clusterMemoryUsage": 20512000000,
        "clusterCPU": 55.53,
        "clusterMemory": 21512000000,
        "Latency": {
          "timestamp": null
        },
        "localResources": [
          {
            "name": "rome-worker",
            "NodetotalCpus": 0,
            "NodetotalMemory": 12455936,
            "Pods": [
              {
                "name": "nginx-local",
                "containersResources": [
                  {
                    "name": "nginx",
                    "ContainertotalMemory": 12455936,
                    "ContainertotalCpus": 0
                  }
                ],
                "PodTotalMemory": 12455936,
                "PodTotalCpus": 0
              }
            ]
          }
        ]
      }
    ],
    "remote": [
      {
        "name": "milan",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "Established",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 13037568,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 13037568,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12808192,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12808192,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 12677120,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12677120,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:19 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 38522880,
        "TotalCpusOffered": 27.675,
        "TotalMemoryOffered": 14040000000,
        "TotalUsedMemoryReceived": 12417000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 14417000000,
        "TotalCpusReceived": 27.855,
        "Latency": {
          "value": "2ms",
          "timestamp": "2024-01-11T17:57:53Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },
      {
        "name": "ClusterIncoming",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "",
        "outgoingResources": null,
        "incomingPeering": "Established",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },
      {
        "name": "ciao",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },{
        "name": "ClusterOutgoing3",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },{
        "name": "ClusterOutgoing4",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },{
        "name": "ClusterOutgoing5",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },{
        "name": "dddddd",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },
      {
        "name": "ClusterOutgoing1",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      },
      {
        "name": "ClusterOutgoing2",
        "networking": "Established",
        "authentication": "Established",
        "outgoingPeering": "Established",
        "outgoingResources": null,
        "incomingPeering": "",
        "incomingResources": [
          {
            "name": "nginx-remote2",
            "containersResources": [
              {
                "name": "nginx-remote2",
                "ContainertotalMemory": 12099584,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12099584,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote3",
            "containersResources": [
              {
                "name": "nginx-remote3",
                "ContainertotalMemory": 12865536,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 12865536,
            "PodTotalCpus": 0
          },
          {
            "name": "nginx-remote4",
            "containersResources": [
              {
                "name": "nginx-remote4",
                "ContainertotalMemory": 11702272,
                "ContainertotalCpus": 0
              }
            ],
            "PodTotalMemory": 11702272,
            "PodTotalCpus": 0
          }
        ],
        "age": "2024-01-11 18:52:25 +0100 CET",
        "TotalUsedCpusOffered": 0,
        "TotalUsedMemoryOffered": 36667392,
        "TotalCpusOffered": 27.855,
        "TotalMemoryOffered": 14417000000,
        "TotalUsedMemoryReceived": 7015000000,
        "TotalUsedCpusReceived": 0,
        "TotalMemoryReceived": 7095000000,
        "TotalCpusReceived": 13.545,
        "Latency": {
          "value": "787μs",
          "timestamp": "2024-01-11T17:57:29Z"
        },
        "localResources": null,
        "TotalLocalCpuUsed": 0,
        "clusterMemoryUsed": 12455936,
      }
    ]
  }
  ]

app.get('/api/foreign_clusters', (req, res) => {
  res.json(fakeResponse[0]);
});

const PORT = 8089;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
