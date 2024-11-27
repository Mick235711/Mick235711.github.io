---
title: "Comparison of Minecraft Launchers"
categories:
- Minecraft
- Mass Survey
- Comparison
feature_image: "/upload/title-pages/minecraft-launcher.jpg"
---
<style>
:root {
    --legendwidth: 120px;
    --launcherwidth: 90px;
}

figure.screenshot, figure.star-count {
    display: block;
    text-align: center;
}
figure.screenshot img {
    vertical-align: top;
}
figure.screenshot figcaption {
    font-size: medium;
}

table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
}

/*@media (prefers-color-scheme: dark) {
    th {
        background-color: #222;
        color: white;
    }
    .dropped, .ext, .yes, .no, .notreally, .mixed, .almost, .kdeapp, .gnomeapp, .mktshare1, .mktshare5, .mktshare20, .mktshare30, .mktshare40, .mktshare100, .otherclients, .mau0, .mau1, .mau2, .mau3, .mau4, .mau5, .mau6 {
        color: black;
    }
    table tr.product td {
        border-color: #333;
    }
}*/

table.comparison {
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
    text-align: center;
    border: none;
    table-layout: fixed;
    font-size: small;
    width: calc(2 * var(--legendwidth) + 10 * var(--launcherwidth));
}

table.comparison tr td table {
    margin: 0;
    padding: 0;
    text-align: center;
    border: none;
    table-layout: fixed;
    font-size: small;
    height: inherit;
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

/*@media (prefers-color-scheme: dark) {
    thead tr td, .legend {
        background-color: #222;
        color: white;
    }
}*/

@media (min-width: 578px) {
    table.comparison tr>td:first-child[colspan="2"], table.comparison tr>td:first-child:not([colspan]) + td, .legend {
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
    width: calc(var(--launcherwidth));
    height: 100%;
}

table.split tr td {
    border: none !important;
    width: 50%;
    overflow-wrap: break-word;
    hyphens: auto;
}

/*table.comparison tr td:first-child[colspan="2"], table.comparison tr td:first-child:not([colspan]) + td {
    border-left: 1px dotted lightgrey;
}

table.comparison tr td:last-child {
    border-right: 1px dotted lightgrey;
}*/

.semititle {
    text-decoration: underline;
    font-weight: bold;
    vertical-align: bottom;
}

table.comparison tr td, table.comparison tr td table tr td {
    line-height: normal;
    vertical-align: middle;
    font-size: small;
}

table.comparison tr td:not(:has(table)), table.comparison tr td table tr td {
    padding: 5px 0 5px 0;
}

.center, table.comparison tr td {
    text-align: center;
}

.tooltip {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: darkred;
}

.tooltip .tooltiptext {
    width: max-content;
    max-width: 200px;
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 5px;
    position: absolute;
    z-index: 1000;
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
    color: #384743;
}

img.logo {
    object-fit: cover;
    width: 80%;
    max-height: 100%;
}

img {
    display: block;
    margin-left: auto;
    margin-right: auto;
}

td.yes,
td.almost,
td.no,
td.mixed,
td.notreally,
td.line,
td.grey, td.blue, td.greyblue, td.extracolour1, td.extracolour2, td.purple, td.purple2, td.purple3 {
    border-top: 1px solid lightgrey;
    border-bottom: 1px solid lightgrey;
    /* FIXME: sticky cannot use border-collapse: collapse */
}

.grey { background-color: lightgrey; }
.blue { background-color: lightblue; }
.greyblue { background-color: #B0C6CD; }
.extracolour2 {background-color: darkkhaki; }
.extracolour1 {background-color: tan; }
.purple { background-color: plum; }
.purple2 { background-color: thistle; }
.purple3 { background-color: violet; }

/*@media (prefers-color-scheme: dark) {
    td.grey, td.blue, td.greyblue, td.extracolour1, td.extracolour2, td.purple, td.purple2, td.purple3 {
        color: black;
    }
}*/
</style>

Being a popular name, Minecraft have billions of players around the world. However, the official launcher really sucks, so there exists a plethora of unofficial, third-party launchers that blews the official one miles away in terms of design and functionality. In this post, I try to compare the functionality of the most popular Minecraft launchers/clients. Due to my inability to use all of the launchers in depth and the inherent subjectivity of the topic, I will not compare the design (aesthetics) and performance of different launchers, only their offered functionality.

# Launcher Selection
As of Nov 2024, I think there are ten most popular launchers out there: (*italics* is the one-line summary that exists on each launcher's official website; these are not my words but theirs.)
1. [Minecraft Official Launcher](https://www.minecraft.net/en-us/download). Well, the one and only, *officially supported*, launcher. Even though its bad performance, poor functionality, and lack of customization is the root cause of these different third-party launchers' existence, we still have to admit that this is the most used launcher, and the one that will be used by the beginners after buying the game.

    **Mod/Modpack Distribution Website Officials**:
2. [Modrinth App](https://modrinth.com/app). *The Modrinth App is a unique, open source launcher that allows you to play your favorite mods, and keep them up to date, all in one neat little package.* Being the official launcher for the newly popularized mod distribution website Modrinth, this launcher have the best builtin integration with Modrinth mods and modpacks, and is often recommended for modders.
3. [CurseForge App](https://www.curseforge.com/download/app). Despite recent controversy, CurseForge is still the oldest, most comprehensive mod distribution website, and its launcher has the best integration with CurseForge mod and modpacks, so this is still the go-to choice for many.
4. [FTB App](https://www.feed-the-beast.com/ftb-app). Being the world's largest modpack distributor, Feed The Best's official launcher was, for a quite long time, the only launcher that can download FTB modpacks directly, and it remained a generally okay launcher even to this day with tight integration.

    **Internationally Popular**:
5. [Prism Launcher](https://prismlauncher.org). *An Open Source Minecraft launcher with the ability to manage multiple instances, accounts and mods. Focused on user freedom and free redistributability.* This is a fork of PolyMC after one of its main author committed several controversy actions, and PolyMC is a fork of ManyMC, who is a fork of MultiMC. [MultiMC](https://multimc.org/) used to be the absolute best multi-instance launcher out there, but its development was abandoned in 2023, so multiple forks had emerged. In this post, for the entire MultiMC-series of launcher, I will just use Prism Launcher as a representative of all the MultiMC forks, since it is the most popular one.
6. [ATLauncher](https://atlauncher.com/). *ATLauncher is a simple and easy to use Minecraft Launcher which contains 155 modpacks for you to choose from, as well as the ability to browse and install packs from other platforms including CurseForge, Modrinth and Technic.* With built-in integration of many modpacks and download channels, this has become a recent favorite for many Minecraft modders.
7. [GDLauncher](https://gdlauncher.com/). *GDLauncher is a simple, yet powerful Minecraft custom launcher with a strong focus on the user experience.* With automatic downloads of mods and modpacks from different channels and a builtin Java version manager, this is also a favorite for many people.

    **Chinese Creation**: (Due to Netease's controversy takeover of Minecraft's distribution in China, many talented developer in China had developed fantastic third-party launchers for the international version of Minecraft, many exceeding the design and functionality provided by these mentioned above. However, a weakness is that these often have not-perfect English support.)
8. [HMCL (Hello Minecraft! Launcher)](https://hmcl.huangyuhui.net/). *A Minecraft Launcher which is multi-functional, cross-platform and popular.* Being one of the oldest launcher developed, it enjoyed unparalleled popularity in China, with many beginner's tutorial directly recommending this launcher. During its early days, pirated play was a focus, but currently it supports official login pretty well.
9. [PCL2 (Plain Craft Launcher 2)](https://afdian.com/a/LTCat). A recently-emerged launcher with convenient, sleek UI, and gained popularity very quickly.
10. [BakaXL](https://www.bakaxl.com/). *BakaXL is distinctive in born. Breaking out the layer concept used by classical launchers, BakaXL is more than satisfying to use. You can use the powerful custom theme feature without any additional purchase, with parallax effect and live wallpaper working together, which is amazing!* Originally designed as a client for a specific server, it has since emerged to one of the best-looking launchers out there, with blazing fast speed and modern design (written with Rust + Tauri).

## What, Your Favorite Launcher Is Not Here?
This guide does not include launchers that
- Only support pirated play of Minecraft. Please buy an official version, it is not expensive.
- Have stopped maintaining.
- Is a fork of one of the above.
- That does not let you create custom instances (such as Technic's official launcher).
- Have a limited user base.

The last one is subjective, but I really think these ten is a good representation of the most popular launchers in 2024. If you have any suggestions, feel free to [open an issue](https://github.com/Mick235711/Mick235711.github.io/issues) to add more launchers.

# Comparison Table
This table only resembles the then-current functionality as of Nov 2024.

<table class="comparison">

<colgroup>
<col style="text-align: left; white-space: nowrap; padding-right: 5px; width: var(--legendwidth);">
<col style="text-align: left; white-space: nowrap; padding-right: 5px; width: var(--legendwidth);"> <!-- legend -->
<col style="border-left: double; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; width: var(--launcherwidth);">
<col style="border-left: 1px solid lightgrey; border-right: solid; width: var(--launcherwidth);">
</colgroup>

<thead>
<tr>
<td class="legend" rowspan="3" colspan="2"></td>
<td class="line">Official</td>
<td class="line" colspan="3">Distribution Official</td>
<td class="line" colspan="3">International</td>
<td class="line" colspan="3">Chinese</td>
</tr>

<tr>
<td rowspan="2">Minecraft Launcher</td>
<td rowspan="2">Modrinth App</td>
<td rowspan="2">CurseForge App</td>
<td rowspan="2">FTB App</td>
<td rowspan="2">Prism Launcher</td>
<td rowspan="2">ATLauncher</td>
<td rowspan="2" class="tooltip">GDLauncher<span class="tooltiptext">This table focuses on the <a href="https://gdlauncher.com/docs/gdlauncher-vs-gdlauncher-carbon/">Carbon version</a></span></td>
<td rowspan="2">HMCL</td>
<td rowspan="2">PCL2</td>
<td>BakaXL</td>
</tr>

<tr>
<td>
<table class="split">
<tr>
<td style="font-size: smaller;">v3</td>
<td class="tooltip" style="font-size: smaller; border-right: 1px solid !important;">v4<span class="tooltiptext">Just <a href="https://www.bakaxl.com/v4">announced</a>, no snapshot binary available yet</span></td>
</tr>
</table>
</td>
</tr>
</thead>

<tbody>
<tr>
<td colspan="2"></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/official-launcher.webp" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/modrinth.avif" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/curseforge.png" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/ftb.png" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/prism-launcher.png" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/atlauncher.svg" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/gdlauncher.png" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/hmcl.ico" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/pcl2.png" /></td>
<td><img class="logo" src="/upload/minecraft-launcher-comparison/logos/bakaxl.png" /></td>
</tr>

<tr>
<td colspan="2"></td>
<td class="semititle line" colspan="10">Development &amp; Background</td>
</tr>

<tr>
<td class="legend" colspan="2">Developer</td>
<td>Microsoft</td>
<td>Modrinth</td>
<td>Curse LLC</td>
<td>Feed The Beast</td>
<td class="tooltip">Community<span class="tooltiptext">A <a href="https://prismlauncher.org/about/">group</a> of 11 maintainers</span></td>
<td>Community</td>
<td>GorillaDevs</td>
<td class="tooltip">Individual<span class="tooltiptext">Made by huangyuhui</span></td>
<td class="tooltip">Individual<span class="tooltiptext">Made by LTCat (龙腾猫跃)</span></td>
<td class="tooltip">Individual<span class="tooltiptext">Made by TT702</span></td>
</tr>

<tr>
<td class="legend" colspan="2">Initial release</td>
<td class="tooltip">2013<span class="tooltiptext">The new launcher (v3.x) is released in Sep 2024</span></td>
<td>2023</td>
<td>2022</td>
<td>2022</td>
<td class="tooltip">2022 (2014 for MultiMC)<span class="tooltiptext">Prism Launcher's first forked version (v5.0) released in Oct 2022, before that it is under the name of PolyMC since Mar 2022, when it is itself forked from MultiMC</span></td>
<td>2016</td>
<td>2018</td>
<td>2015</td>
<td>2018</td>
<td>2015</td>
</tr>

<tr>
<td class="legend" colspan="2">Open source?</td>
<td class="no">No</td>
<td class="yes"><a href="https://github.com/modrinth/code/blob/main/apps/app/README.md">Yes</a></td>
<td class="no">No</td>
<td class="yes"><a href="https://github.com/FTBTeam/FTB-App">Yes</a></td>
<td class="yes"><a href="https://github.com/PrismLauncher/PrismLauncher">Yes</a></td>
<td class="yes"><a href="https://github.com/ATLauncher/ATLauncher">Yes</a></td>
<td class="yes"><a href="https://github.com/gorilla-devs/GDLauncher">Yes</a></td>
<td class="yes"><a href="https://github.com/HMCL-dev/HMCL">Yes</a></td>
<td class="almost tooltip"><a href="https://github.com/Hex-Dragon/PCL2">Stable versions only</a><span class="tooltiptext">Source code repo is only updated after each stable release</span></td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend" colspan="2">License</td>
<td>N/A</td>
<td>GPL-3.0</td>
<td>N/A</td>
<td>LGPL-2.1</td>
<td>GPL-3.0</td>
<td>GPL-3.0</td>
<td>GPL-3.0</td>
<td>GPL-3.0</td>
<td><a href="https://github.com/Hex-Dragon/PCL2/blob/main/LICENCE">Custom</a></td>
<td>N/A</td>
</tr>

<tr>
<td class="legend tooltip" colspan="2">Development builds?<span class="tooltiptext">Including nightly, beta, ...</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes"><a href="https://github.com/FTBTeam/FTB-App/tags">Yes</a></td>
<td class="yes tooltip"><a href="https://prismlauncher.org/wiki/development/development-builds/">Yes</a><span class="tooltiptext">Per-commit build. Also available as -git packages</span></td>
<td class="yes"><a href="https://atl.pw/launcher-nightly">Yes</a></td>
<td class="yes"><a href="https://github.com/gorilla-devs/GDLauncher/releases">Yes</a></td>
<td class="yes"><a href="https://hmcl.huangyuhui.net/download/">Yes</a></td>
<td class="mixed"><a href="https://afdian.com/p/0164034c016c11ebafcb52540025c377">Paywalled</a></td>
<td class="line"><table class="split" style="height: 44px;"><tr>
<td class="yes tooltip"><a href="http://jk-insider.bakaxl.com:8888/job/BakaXL%20Insider%20Parrot/lastSuccessfulBuild/">Yes</a><span class="tooltiptext">Already in LTS, no new feature planned</span></td>
<td class="no tooltip">No<span class="tooltiptext">Insider preview available for <a href="https://afdian.com/a/TT702">paid members</a></span></td>
</tr></table></td>
</tr>

<tr>
<td class="legend" colspan="2">Core Language</td>
<td>C++</td>
<td>Rust</td>
<td rowspan="2">Unknown</td>
<td>TypeScript</td>
<td>C++</td>
<td>Java</td>
<td class="tooltip">Rust<span class="tooltiptext">The old version was written in JavaScript</span></td>
<td>Java</td>
<td>VB.NET</td>
<td><table class="split"><tr>
<td>JavaScript</td>
<td>Rust</td>
</tr></table></td>
</tr>

<tr>
<td class="legend tooltip" colspan="2">UI Framework<span class="tooltiptext">Many also used Vue, which will not be listed</span></td>
<td>Chromium Embedded Framework</td>
<td>Tauri</td>
<td>Electron</td>
<td>Qt</td>
<td>Java Swing</td>
<td class="tooltip">SolidJS<span class="tooltiptext">The old version was written in Electron</span></td>
<td>JavaFX</td>
<td>WPF</td>
<td><table class="split"><tr>
<td>Electron</td>
<td>Tauri</td>
</tr></table></td>
</tr>

<tr>
<td colspan="2"></td>
<td class="semititle line" colspan="10">Platform Support</td>
</tr>

<tr>
<td class="legend" rowspan="3">Windows</td>
<td class="legend">64-bit</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
</tr>

<tr>
<td class="legend tooltip" style="z-index: 1000;">32-bit<span class="tooltiptext">Latest Minecraft version that supports 32-bit OS is 1.20.4</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no tooltip">No<span class="tooltiptext">MultiMC has 32-bit support</span></td>
<td class="almost tooltip">Should work<span class="tooltiptext">JAR file provided</span></td>
<td class="no">No</td>
<td class="yes">Yes</td>
<td class="almost tooltip">Yes<span class="tooltiptext">32-bit support works, but <a href="https://github.com/Hex-Dragon/PCL2/issues/3649">no maintenance work is planned</a>. Bugfix reports will be ignored</span></td>
<td class="yes">Yes</td>
</tr>

<tr>
<td class="legend tooltip">ARM 64-bit<span class="tooltiptext">Officially supported only after 1.19</span></td>
<td class="yes">Yes</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes">Yes</td>
<td class="almost tooltip">Should work<span class="tooltiptext">JAR file provided</span></td>
<td class="no">No</td>
<td class="yes tooltip">Yes<span class="tooltiptext">HMCL extended Minecraft ARM support to 1.8</span></td>
<td class="no"><a href="https://github.com/Hex-Dragon/PCL2/issues/1960">No</a></td>
<td class="line"><table class="split"><tr>
<td class="no">No</td>
<td class="yes">Yes</td>
</tr></table></td>
</tr>

<tr>
<td class="legend" rowspan="2">macOS</td>
<td class="legend">64-bit</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes" rowspan="2">Universal</td>
<td class="yes">Yes</td>
<td class="yes" rowspan="2">Universal</td>
<td class="yes" rowspan="2">Universal JAR</td>
<td class="yes" rowspan="2">Universal</td>
<td class="yes tooltip" rowspan="2">Universal JAR<span class="tooltiptext">HMCL extended Minecraft ARM support to 1.8 using Rosetta 2</span></td>
<td class="no" rowspan="5"><a href="https://github.com/Hex-Dragon/PCL2/issues/54">No</a></td>
<td class="line"><table class="split"><tr>
<td class="no">No</td>
<td class="mixed">Unknown</td>
</tr></table></td>
</tr>

<tr>
<td class="legend tooltip">ARM 64-bit<span class="tooltiptext">Officially supported only after 1.19</span></td>
<td class="almost">Rosetta 2</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="line"><table class="split"><tr>
<td class="no">No</td>
<td class="yes">Yes</td>
</tr></table></td>
</tr>

<tr>
<td class="legend" rowspan="2">Linux</td>
<td class="legend">64-bit</td>
<td class="almost">DEB+TAR</td>
<td class="yes">DEB+RPM</td>
<td class="mixed">DEB only</td>
<td class="yes">DEB+RPM</td>
<td class="mixed">TAR only</td>
<td class="yes">DEB+RPM</td>
<td class="mixed">AppImage only</td>
<td class="yes">JAR</td>
<td class="line"><table class="split" style="height: 44px;"><tr>
<td class="no">No</td>
<td class="yes">Yes</td>
</tr></table></td>
</tr>

<tr>
<td class="legend tooltip" style="z-index: 1000;">ARM 64-bit<span class="tooltiptext">Officially supported only after 1.19</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes">DEB+RPM</td>
<td class="mixed">Flatpak only</td>
<td class="almost">JAR</td>
<td class="no">No</td>
<td class="yes">JAR</td>
<td class="line"><table class="split"><tr>
<td class="no">No</td>
<td class="mixed">Unknown</td>
</tr></table></td>
</tr>

<tr>
<td class="legend tooltip" colspan="2">Other<span class="tooltiptext">No official support</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="mixed">JAR may work</td>
<td class="no">No</td>
<td class="yes tooltip">JAR<span class="tooltiptext">HMCL <a href="https://github.com/HMCL-dev/HMCL/blob/main/PLATFORM.md">supports</a> ARM32, MIPS64el, RISC-V 64, LoongArch64, and FreeBSD</span></td>
<td class="no">No</td>
</tr>

<tr>
<td colspan="2"></td>
<td class="semititle line tooltip" colspan="10">Distribution Channel<span class="tooltiptext">Only Intel/AMD 64-bit distributions are considered</span></td>
</tr>

<tr>
<td class="legend tooltip" colspan="2">Portable<span class="tooltiptext">i.e. no setup and no dependency executable</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes">Yes</td>
<td class="yes tooltip">Yes<span class="tooltiptext">Windows only; other platform can use JAR</span></td>
<td class="no">No</td>
<td class="yes tooltip">Yes<span class="tooltiptext">Windows only; other platform can use JAR</span></td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend" rowspan="4">Windows</td>
<td class="legend">Microsoft Store</td>
<td class="yes"><a href="https://www.xbox.com/en-SG/games/store/minecraft-launcher/9pgw18npbzv5?ocid=storeforweb">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">WinGet</td>
<td class="yes"><a href="https://winget.run/pkg/Mojang/MinecraftLauncher">Yes</a></td>
<td class="yes"><a href="https://winstall.app/apps/Modrinth.ModrinthApp">Yes</a></td>
<td class="yes"><a href="https://winget.run/pkg/Overwolf/CurseForge">Yes</a></td>
<td class="yes"><a href="https://winstall.app/apps/FTB.App">Yes</a></td>
<td class="yes"><a href="https://winget.run/pkg/PrismLauncher/PrismLauncher">Yes</a></td>
<td class="yes"><a href="https://winget.run/pkg/ATLauncher/ATLauncher">Yes</a></td>
<td class="yes"><a href="https://winget.run/pkg/GorillaDevs/GDLauncher">Yes</a></td>
<td class="yes"><a href="https://winget.run/pkg/huanghongxun/HelloMinecraftLauncher">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">Chocolatey</td>
<td class="almost"><a href="https://community.chocolatey.org/packages/minecraft-launcher">Unofficial</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="almost"><a href="https://community.chocolatey.org/packages/ftb">Unofficial</a></td>
<td class="almost"><a href="https://community.chocolatey.org/packages/prismlauncher">Unofficial</a></td>
<td class="no">No</td>
<td class="almost"><a href="https://community.chocolatey.org/packages/gdlauncher">Unofficial</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">Scoop</td>
<td class="yes tooltip">Yes<span class="tooltiptext">games/minecraft</span></td>
<td class="mixed">Unofficial</td>
<td class="mixed">Unofficial</td>
<td class="no">No</td>
<td class="yes tooltip">Yes<span class="tooltiptext">games/prismlauncher[-git]</span></td>
<td class="mixed">Unofficial</td>
<td class="mixed">Unofficial</td>
<td class="mixed">Unofficial</td>
<td class="mixed">Unofficial</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">macOS</td>
<td class="legend">Homebrew</td>
<td class="yes"><a href="https://formulae.brew.sh/cask/minecraft">Yes</a></td>
<td class="yes"><a href="https://formulae.brew.sh/cask/modrinth">Yes</a></td>
<td class="yes"><a href="https://formulae.brew.sh/cask/curseforge">Yes</a></td>
<td class="yes"><a href="https://formulae.brew.sh/cask/feed-the-beast">Yes</a></td>
<td class="yes"><a href="https://formulae.brew.sh/cask/prismlauncher">Yes</a></td>
<td class="yes"><a href="https://formulae.brew.sh/cask/atlauncher">Yes</a></td>
<td class="yes"><a href="https://formulae.brew.sh/cask/gdlauncher">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend" rowspan="3">Linux Universal</td>
<td class="legend">Flathub</td>
<td class="mixed"><a href="https://flathub.org/apps/com.mojang.Minecraft">Unofficial</a></td>
<td class="yes tooltip"><a href="https://flathub.org/apps/com.modrinth.ModrinthApp">Yes<span class="tooltiptext">Although unverified, recommended by the official website</span></a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes"><a href="https://flathub.org/apps/org.prismlauncher.PrismLauncher">Yes</a></td>
<td class="yes"><a href="https://flathub.org/apps/com.atlauncher.ATLauncher">Yes</a></td>
<td class="mixed"><a href="https://flathub.org/apps/io.gdevs.GDLauncher">Unofficial</a></td>
<td class="no">No</td>
<td class="no" rowspan="3">No</td>
<td class="no" rowspan="3">No</td>
</tr>

<tr>
<td class="legend">AppImage</td>
<td class="mixed"><a href="https://portable-linux-apps.github.io/apps/minecraft-launcher.html">AppMan</a></td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="yes">Yes</td>
<td class="no">No</td>
<td class="yes">Yes</td>
<td class="mixed"><a href="https://portable-linux-apps.github.io/apps/hmcl.html">AppMan</a></td>
</tr>

<tr>
<td class="legend">Snap</td>
<td class="mixed"><a href="https://snapcraft.io/mc-installer">Unofficial</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="notreally"><a href="https://snapcraft.io/gdlauncher">Abandoned</a></td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend" rowspan="10">Linux Distros</td>
<td class="legend">Alpine</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="almost"><a href="https://pkgs.alpinelinux.org/package/edge/community/x86_64/prismlauncher">Community</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend tooltip">Arch<span class="tooltiptext">incl. Manjaro</span></td>
<td class="almost tooltip"><a href="https://aur.archlinux.org/packages/minecraft-launcher">AUR</a><span class="tooltiptext">Officially recommended</span></td>
<td class="mixed"><a href="https://aur.archlinux.org/packages/modrinth-app">AUR</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes"><a href="https://archlinux.org/packages/extra/x86_64/prismlauncher/">Yes</a></td>
<td class="mixed"><a href="https://aur.archlinux.org/packages/atlauncher">AUR</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend tooltip">Fedora<span class="tooltiptext">incl. CentOS Stream/RHEL</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="mixed"><a href="https://copr.fedorainfracloud.org/coprs/g3tchoo/prismlauncher/">COPR</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend tooltip">Debian<span class="tooltiptext">incl. Ubuntu</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="mixed"><a href="https://mpr.makedeb.org/packages/prismlauncher">MPR</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">Pi OS</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes"><a href="https://pi-apps.io/wiki/getting-started/apps-list/#minecraft-java-prism-launcher">Yes</a></td>
<td class="no">No</td>
<td class="yes"><a href="https://pi-apps.io/wiki/getting-started/apps-list/#minecraft-java-gdlauncher">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">Gentoo</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes"><a href="https://packages.gentoo.org/packages/games-action/prismlauncher">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">NixOS</td>
<td class="no">No</td>
<td class="yes"><a href="https://search.nixos.org/packages?query=modrinth-app">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes"><a href="https://search.nixos.org/packages?query=prismlauncher">Yes</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend tooltip">openSUSE<span class="tooltiptext">incl. SLE</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="mixed"><a href="https://build.opensuse.org/package/show/home:getchoo/prismlauncher">OBS</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">Slackware</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="mixed"><a href="https://slackbuilds.org/repository/15.0/games/PrismLauncher/">SlackBuilds</a></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>

<tr>
<td class="legend">Void</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="yes tooltip">Yes<span class="tooltiptext">PrismLauncher</span></td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
<td class="no">No</td>
</tr>
</tbody>

</table>

# Screenshots
Several screenshots, mostly from official websites, to give a sense on what the UI for each launcher looks like.

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/official-launcher.webp" alt="Official Launcher">
    <figcaption>Official Launcher</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/modrinth.webp" alt="Modrinth App">
    <figcaption>Modrinth App v0.8.9</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/curseforge.webp" alt="Modrinth App">
    <figcaption>CurseForge App v1.265.0</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/ftb.webp" alt="FTB App">
    <figcaption>FTB App v1.26.3</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/prism-launcher.webp" alt="Prism Launcher">
    <figcaption>Prism Launcher v9.1</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/atlauncher.webp" alt="ATLauncher">
    <figcaption>ATLauncher v3.4.38.0</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/gdlauncher.webp" alt="GDLauncher">
    <figcaption>GDLauncher v2.0.20</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/hmcl.png" alt="HMCL">
    <figcaption>HMCL v3.2.134</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/pcl2.jpg" alt="PCL2">
    <figcaption>PCL v2.8.9</figcaption>
</figure>

<figure class="image screenshot">
    <img src="/upload/minecraft-launcher-comparison/bakaxl.png" alt="BakaXL">
    <figcaption>BakaXL v3.5.1.0</figcaption>
</figure>

# Star History Charts
Here is the GitHub star history graph for some of the launchers above:
<figure class="image star-count">
<a href="https://star-history.com/#modrinth/code&FTBTeam/FTB-App&MultiMC/Launcher&PrismLauncher/PrismLauncher&ATLauncher/ATLauncher&gorilla-devs/GDLauncher&HMCL-dev/HMCL&Hex-Dragon/PCL2&BakaXL-Launcher/BakaXL&Date">
<img src="https://api.star-history.com/svg?repos=modrinth/code,FTBTeam/FTB-App,MultiMC/Launcher,PrismLauncher/PrismLauncher,ATLauncher/ATLauncher,gorilla-devs/GDLauncher,HMCL-dev/HMCL,Hex-Dragon/PCL2,BakaXL-Launcher/BakaXL&type=Date" alt="Star History Chart">
</a>
</figure>

Notes:
- PCL2 and BakaXL are not fully open-sourced, so their star counts are not representative.
- MultiMC has stopped development after 2023, hence the difference in trend.
- Modrinth's repo contains both the code for the app and the entire website.

