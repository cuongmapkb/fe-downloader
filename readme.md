# FrontendMasters Downloader

Download courses from FrontendMasters using puppeteer

<p align="center">
    <img src="https://raw.githubusercontent.com/me-majidi/fe-downloader/master/demo-min.gif"/>
</p>

## Features

* Interactive interface
* Support free accounts
* Custom waiting delay between downloads
* Skip downloaded videos
* Keep session for later usage

## Getting Started

### Installation

```bash
npm install fe-downloader -g
```

### Requirements

* Node v7.6.0 or greater
* Google Chrome
* ChromeDriver - WebDriver for Chrome

### Options

| Name         | Description                               | Default |
| ------------ | ----------------------------------------- | ------- |
| delay        | waiting delay in minute between downloads | 5       |
| open-browser | open underlying chromimum                 | false   |

## Usage

```bash
fe-downloader --delay 4 --open-brwoser
```
