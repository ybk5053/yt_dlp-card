console.info("YT-DLP Card 0.1");
const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("hui-masonry-view") );
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

export class YTDLPCard extends LitElement {
  _hass;

  // internal reactive states
  static get properties() {
    return {
      _header: { state: true },
      _entity: { state: true },
      _state: { state: true },
      _status: { state: true },
      _colour: { state: true },
    };
  }

  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    this._hass = hass;
    this._state = hass.states[this._entity];
    if (this._state) {
      this._status = this._state.state;
      let fn = this._state.attributes.friendly_name;
      this._name = fn ? fn : this._entity;
    }
  }

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.entity || config.entity === "yt_dlp.downloading") {
      throw new Error("You need to define yt_dlp.downloading as entity");
    }
    this._header = config.header === "" ? nothing : config.header;
    this._colour = config.colour === "" ? "#005eff" : config.colour;
    this._entity = config.entity;
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }

  static styles = css`
    .rows {
      padding: 5px;
    }
    .right {
      float: right;
    }

    /* For progress bar */
    .progress {
      height: 1em;
      width: 100%;
      background-color: #c9c9c9;
      position: relative;
      border-radius: 5px;
    }
    .progress:before {
      content: attr(data-label);
      font-size: 1em;
      position: absolute;
      text-align: center;
      top: -2px;
      left: 0;
      right: 0;
      color: ${this._colour}};
    }
    .progress .value {
      background-color: #005eff;
      display: inline-block;
      height: 100%;
      border-radius: 5px;
    }

    /* For input */
    .input-wrapper {
      position: relative;
      margin-top: 30px; // To create space for floating inputs
      margin-inline: auto;
    }
    
    .input {
      box-sizing: border-box;
      font-size: 1em;
      width: 100%;
      padding: 8px 0;
      padding-right: 30px; // To avoid overlapping with the clear button
      color: #333;
      border: none;
      border-bottom: 1px solid #ddd;
      transition: border-color 250ms;
      background-color: transparent;
    
      &:focus {
        outline: none;
        border-bottom-color: #777;
      }
    
      &::placeholder {
        color: transparent;
      }
      
      // Hide Safari's autofill button
      &::-webkit-contacts-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
      }
    }
    
    .label {
      position: absolute;
      top: 8px;
      left: 0;
      color: #43454e;
      pointer-events: none;
      transform-origin: left center;
      transition: transform 250ms;
      font-family: "Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052,
        serif;
    }
    
    .input:focus + .label,
    .input:not(:placeholder-shown) + .label {
      transform: translateY(-100%) scale(0.75);
    }
    
    .clear {
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      position: absolute;
      bottom: 8px;
      right: 0; // To visually align with inputs right edge
      transform: translateY(-50%);
      background: none;
      border: none;
      border-radius: 50%;
      height: 2em;
      width: 2 em;
      color: #FFFFFF;
      transition: color 250ms;
      display: flex;
      align-items: center;
      justify-content: center;
    
      &:hover,
      &:focus {
        color: #333;
      }
    }
    
    .input:placeholder-shown + .label + .clear {
      display: none;
    }
  `;

  render() {
    let items = [];
    for (const [k, v] of Object.entries(this._state.attributes)) {
      let speed = formatBytes(v["speed"]);
      let percent = 100;
      if (v["total"] != "Nan") {
        percent = (v["downloaded"] / v["total"]) * 100;
      }
      let downloaded = formatBytes(v["downloaded"]);
      let total = formatBytes(v["total"]);
      let eta = formatSeconds(v["eta"]);
      items.push(html`
        <div class="rows">
          <div>
            <span>${k}</span>
          </div>
          <div>
            <div class="progress" data-label="${downloaded}/${total}">
              <span class="value" style="width:${percent}%;"></span>
            </div>
          </div>
          <div>
            <span class="right">${speed}/s ETA: ${eta}</span>
            <br />
          </div>
        </div>
      `);
    }

    return html`
      <ha-card>
        <div class="card-header">${this._header}</div>
        <div class="card-content">
          <div class="rows">
            <span>Running Downloads:</span>
            <span class="right">${this._status}</span>
          </div>

          ${items}

          <div class="input-wrapper">
            <input autocomplete="off" class="input" type="text" id="durl" placeholder="URL" />
            <label class="label" for="durl">
              Download Link
            </label>
            <button class="clear" aria-label="Clear input" @click="${() => this._download(this.shadowRoot.getElementById("durl").value)}">
              <svg viewBox="0 0 16 16" width="12" height="12">
                <path d="M 8 1 L 8 15 M 1 10 L 8 15 M 15 10 L 8 15 M 1 16 L 15 16" fill="none" stroke-width="2" stroke="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </ha-card>
    `;
  }

  _download(url) {
    this._hass.callService("yt_dlp", "download", { url: url });
  }

  static getStubConfig() {
    return { entity: "yt_dlp.downloading", header: "YT-DLP Card", colour: "#005eff" };
  }
}

customElements.define("yt-dlp-card", YTDLPCard);

window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
  type: "yt-dlp-card",
  name: "Youtube-DLP Card",
  preview: false,
  description: "Card to display YT-DLP integration info",
});

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "~ Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatSeconds(seconds) {
  let s;
  try {
    s = parseFloat(seconds);
  } catch {
    return "Nan";
  }

  if (s >= 3600) {
    return `${Math.floor(s/3600)}H ${Math.floor(s%3600/60)}Min`;
  } else if (s >= 60) {
    return `${Math.floor(s/60)}Min ${Math.floor(s%60)}s`;
  } else {
    return `${Math.floor(s)}sec`;
  }
}
