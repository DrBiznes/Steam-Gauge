# Steam Gauge

I made two games using Steam's data.

## Wit's This Then?

Two wee games built using the [Steam Store API](https://store.steampowered.com/api) and [SteamSpy API](https://steamspy.com/api.php):

1. **Gauge-ing Game** - Guess which game's got better Steam reviews. Dead simple but proper addictive.
2. **Cover Artfuscation** - Like Framed but for Steam games. Pictures start all pixelated and get clearer as ye guess wrong.

## How's It Work?

Built with React, TypeScript, and Zustand for the brains, Tailwind CSS for the looks, and Framer Motion for the smooth moves. Uses AllOrigins as a CORS proxy to get all the APIs playing nice together.

## Try It Out

Visit [gauge.jamino.me](https://gauge.jamino.me) to give it a go.

## Local Setup

```bash
# Get the files
git clone https://github.com/DrBiznes/steam-gauge.git

# Install the bits and bobs
npm install

# Fire it up
npm run dev
```

## Thanks To

- [Valve](https://www.valvesoftware.com/) for the Steam platform and APIs
- [SteamSpy](https://steamspy.com/) for their pure reliable data
- [AllOrigins](https://allorigins.win/) for sorting out our CORS headaches

## Disclaimer

Not officially connected with Valve in any way. Just a wee project using their public APIs.

## License

MIT