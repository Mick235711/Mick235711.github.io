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

figure.screenshot {
    display: block;
    text-align: center;
}
figure.screenshot img {
    vertical-align: top;
}
figure.screenshot figcaption {
    font-size: medium;
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
10. [BakaXL](https://www.bakaxl.com/). *BakaXL is distinctive in born. Breaking out the layer concept used by classical launchers, BakaXL is more than satisfying to use. You can use the powerful custom theme feature without any additional purchase, with parallax effect and live wallpaper working together, which is amazing!* One of the best-looking launchers out there, with blazing fast speed and modern design (written with Rust + Tauri).

## What, Your Favorite Launcher Is Not Here?
This guide does not include launchers that
- Only support pirated play of Minecraft. Please buy an official version, it is not expensive.
- Have stopped maintaining.
- Is a fork of one of the above.
- That does not let you create custom instances (such as Technic's official launcher).
- Have a limited user base.

The last one is subjective, but I really think these ten is a good representation of the most popular launchers in 2024. If you have any suggestions, feel free to [open an issue](https://github.com/Mick235711/Mick235711.github.io/issues) to add more launchers.

# Comparison Table

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
[![Star History Chart](https://api.star-history.com/svg?repos=MultiMC/Launcher,PrismLauncher/PrismLauncher,ATLauncher/ATLauncher,gorilla-devs/GDLauncher,HMCL-dev/HMCL,Hex-Dragon/PCL2,BakaXL-Launcher/BakaXL&type=Date)](https://star-history.com/#MultiMC/Launcher&PrismLauncher/PrismLauncher&ATLauncher/ATLauncher&gorilla-devs/GDLauncher&HMCL-dev/HMCL&Hex-Dragon/PCL2&BakaXL-Launcher/BakaXL&Date)

Note that PCL2 and BakaXL is not fully open-sources, so its star count is not representative. MultiMC has stopped development after 2023, hence the difference in trend.

