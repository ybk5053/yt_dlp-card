# Home Assistant Card for use with YT-DLP

The integration [`Yt_dlp_hass`](https://github.com/ybk5053/yt_dlp_hass) needs to be enabled before using the card.

![image](https://raw.githubusercontent.com/ybk5053/yt_dlp-card/main/img/downloading.jpg)
*Download info*
![image](https://raw.githubusercontent.com/ybk5053/yt_dlp-card/main/img/waiting.jpg)
*Empty  Card*

## HACS

- Add Custom Repositories

```text
Repository: https://github.com/ybk5053/yt_dlp-card
Category: Lovelace
```

## Manual Installation

- Download [yt_dlp-card.js](https://github.com/ybk5053/yt_dlp-card/blob/main/dist/yt_dlp-card.js)
- Copy to www/yt_dlp-card/
- Add the following to your resources

```text
url: /local/yt_dlp-card/yt_dlp-card.js
type: Javascript Module
```

## Adding the Card to the Dashboard

Look for "Custom: Youtube-DLP Card" in the card list.

Only the colour option should be changed. Any colour recognised by html/css.
