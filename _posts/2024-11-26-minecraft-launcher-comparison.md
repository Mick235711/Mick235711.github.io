---
title: "Comparison of Minecraft Launchers"
categories:
- Minecraft
- Mass Survey
- Comparison
feature_image: "/upload/minecraft-launcher.jpg"
---
<style>
:root {
    --legendwidth: 275px;
    --distrowidth: 95px;
}

table.comparison {
    margin-top: 1em;
    text-align: center;
    border: none;
    table-layout: fixed;
    font-size: small;
    width: calc(var(--legendwidth) + 17 * var(--distrowidth));
    height: 100%;
}

thead {
    border: none;
    position: sticky;
    position: -webkit-sticky;
    top: 0px;
    z-index: 10;
}

thead tr td {
    background-color: white;
    font-weight: bold;
}

.legend {
    background-color: white;
    z-index: 999;
}

@media (prefers-color-scheme: dark) {
    thead tr td, .legend {background-color: #222; color: white;  }
}

@media (min-width: 578px){
    table.comparison tr>td:first-child, .legend {
        position: -webkit-sticky;
        position: sticky;
        left: 0;
    }
}

td {
    border: none;
    padding: 0px;
    vertical-align: top;
    overflow-wrap: break-word;
    hyphens: auto;
}

td img {
    padding: 15px 0px;
}

table.split {
    border: none;
    table-layout: fixed;
    width: calc(var(--distrowidth));
    height: 100%;
}

table.split tr td {
    border: none !important;
    width: 50%;
    overflow-wrap: break-word;
    hyphens: auto;
}

table.comparison tr td:nth-child(2) {
    border-left: 1px dotted lightgrey;
}

.semititle {
    text-decoration: underline;
    font-weight: bold;
    vertical-align: bottom;
}

.legend {
    text-align: left;
    white-space: nowrap;
    padding-right: 5px;
}

.center {
    text-align: center;
}

.tooltip {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: darkred;
}

.tooltip .tooltiptext {
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 5px;
    position: absolute;
    z-index: 1;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
    font-weight: normal;
}

.yes {
    background-color: #CEE6BB;
}

.almost {
    background-color: #E7F2DD;
}

.mixed {
    background-color: #E7DEB1;
}

.notreally {
    background-color: #F5E0D6;
}

.no {
    background-color: #EBC1AD;
}

img.logo {
    width: 90%;
}

td.yes,
td.almost,
td.no,
td.mixed,
td.notreally,
td.line,
td.grey, td.blue, td.greyblue, td.extracolour1, td.extracolour2, td.purple, td.purple2, td.purple3 {
    border-top: 1px solid ivory;
    border-bottom: 1px solid ivory;
}

.grey { background-color: lightgrey; }
.blue { background-color: lightblue; }
.greyblue { background-color: #B0C6CD; }
.extracolour2 {background-color: darkkhaki; }
.extracolour1 {background-color: tan; }
.purple { background-color: plum; }
.purple2 { background-color: thistle; }
.purple3 { background-color: violet; }

@media (prefers-color-scheme: dark) {
    td.grey, td.blue, td.greyblue, td.extracolour1, td.extracolour2, td.purple, td.purple2, td.purple3 { color: black;  }
}
</style>

