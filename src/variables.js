export const DataBlick = ["#000000","#FDC219","#00BFF3","#F07AAE"]
export const NurielStone = ["#8175AA", "#6FB899", "#31A1B3", "#CCB22B", "#A39FC9", "#94D0C0", "#959C9E", "#027B8E", "#9F8F12"]
export const JewelBright = ["#EB1E2C","#FD6F30","#F9A729","#F9D23C","#F5BB68","#64CDCC","#91DCEA","#A4A4D5","#BBC9E5"]
export const defaultColor = ["#D3D3D3"]
export const demoColors = ["#000000"] // colorlogical
export const semioticDefault = ['#00a2ce','#4d430c','#b3331d','#b6a756']
export const rainbow = ['#1BA3C6', '#34BFB7', '#25AB74', '#65A734', '#D1BB21', '#F89F1A', '#EA541E', '#EC374D', '#F86A96', '#DD6CBA', '#966EC3', '#4F7CBA']

export const colors = [
  {palleteName: "Default Color", hexValues: defaultColor},
  {palleteName: "Demo Color", hexValues: defaultColor},
  {palleteName: "Nuriel Stone", hexValues: NurielStone},
  {palleteName: "Jewel Bright", hexValues: JewelBright},
  {palleteName: "DataBlick", hexValues: DataBlick},
  {palleteName: "Semiotic", hexValues: semioticDefault},
]

export const dematrixifiedEdges1 = [
  { source: "a", target: "a", value: 10},
  { source: "a", target: "b", value: 10},
  { source: "a", target: "c", value: 10},
  { source: "b", target: "a", value: 10},
  { source: "b", target: "b", value: 10},
  { source: "b", target: "c", value: 10},
  { source: "c", target: "a", value: 10},
  { source: "c", target: "b", value: 10},
  { source: "c", target: "c", value: 10},
]

export const dematrixifiedEdges2 = [
  { source: "a", target: "a", value: 5},
  { source: "a", target: "b", value: 5},
  { source: "a", target: "c", value: 5},
  { source: "b", target: "a", value: 5},
  { source: "b", target: "b", value: 5},
  { source: "b", target: "c", value: 5},
  { source: "c", target: "a", value: 5},
  { source: "c", target: "b", value: 5},
  { source: "c", target: "c", value: 5},
]

export const semioticTypes = {
  "Tidy Tree": "tree",
  "Dendogram": "cluster",
  "Network": "force",
  "Circlepack": "circlepack",
  "Treemap": "treemap",
  "Partition": "partition",
}

export const sketchyTypes = {
    "normal": { renderMode: "normal" },
    "solid-fill": { renderMode: "sketchy", fillStyle: "solid" },
    "hachure-thin": { renderMode: "sketchy", hachureGap: 3, fillWeight: 1, fillStyle: "hachure" },
    "hachure-thin-fill": { renderMode: "sketchy", hachureGap: 1.5, fillWeight: 1, fillStyle: "hachure" },
    "hachure-thick": { renderMode: "sketchy", hachureGap: 4, fillWeight: 2, fillStyle: "hachure" },
    "hachure-thick-fill": { renderMode: "sketchy", hachureGap: 2.5, fillWeight: 2, fillStyle: "hachure" },
    "dots": { renderMode: "sketchy", hachureGap: 5, fillWeight: 1, fillStyle: "dots" },
    "dots-fill": { renderMode: "sketchy", hachureGap: 2.5, fillWeight: 1, fillStyle: "dots" },
    "dashed": { renderMode: "sketchy", hachureGap: 3, dashGap: 2, fillWeight: 1, fillStyle: "dashed" },
    "dashed-fill": { renderMode: "sketchy", hachureGap: 1, dashGap: 2, fillWeight: 1, fillStyle: "dashed" },
    "cross-hatch": { renderMode: "sketchy", hachureGap: 4, fillStyle: "cross-hatch" },
    "cross-hatch-fill": { renderMode: "sketchy", hachureGap: 2, fillStyle: "cross-hatch" },
    "zigzag": { renderMode: "sketchy", hachureGap: 5, fillWeight: 2, fillStyle: "zigzag" },
    "zigzag-fill": { renderMode: "sketchy", hachureGap: 4, fillWeight: 2, fillStyle: "zigzag" },
    "zigzag-line": { renderMode: "sketchy", hachureGap: 3, fillWeight: 1.5, fillStyle: "zigzag-line" }
}