import { PolkadotUIRpc } from "./polkadot-ui-rpc";

describe("PolkadotUIRpc", () => {
  it("getPolkadotSvgIcon", async () => {
    const svgData = await PolkadotUIRpc.getPolkadotSvgIcon(
      "5DAqex3WuhWFJpXE3TFtDmAoJPiw4QGq1mVPoNz7Vh6B4iyB"
    );
    expect(svgData).toStrictEqual([
      { cx: 32, cy: 32, fill: "#eee", r: 32 },
      { cx: 32, cy: 8, fill: "hsl(45, 72%, 35%)", r: 5 },
      { cx: 32, cy: 20, fill: "hsl(309, 72%, 15%)", r: 5 },
      { cx: 21.607695154586736, cy: 14, fill: "hsl(331, 72%, 75%)", r: 5 },
      { cx: 11.215390309173472, cy: 20, fill: "hsl(163, 72%, 75%)", r: 5 },
      { cx: 21.607695154586736, cy: 26, fill: "hsl(348, 72%, 35%)", r: 5 },
      { cx: 11.215390309173472, cy: 32, fill: "hsl(337, 72%, 35%)", r: 5 },
      { cx: 11.215390309173472, cy: 44, fill: "hsl(112, 72%, 53%)", r: 5 },
      { cx: 21.607695154586736, cy: 38, fill: "hsl(95, 72%, 35%)", r: 5 },
      { cx: 21.607695154586736, cy: 50, fill: "hsl(337, 72%, 35%)", r: 5 },
      { cx: 32, cy: 56, fill: "hsl(163, 72%, 75%)", r: 5 },
      { cx: 32, cy: 44, fill: "hsl(348, 72%, 35%)", r: 5 },
      { cx: 42.392304845413264, cy: 50, fill: "hsl(331, 72%, 75%)", r: 5 },
      { cx: 52.78460969082653, cy: 44, fill: "hsl(45, 72%, 35%)", r: 5 },
      { cx: 42.392304845413264, cy: 38, fill: "hsl(309, 72%, 15%)", r: 5 },
      { cx: 52.78460969082653, cy: 32, fill: "hsl(5, 72%, 35%)", r: 5 },
      { cx: 52.78460969082653, cy: 20, fill: "hsl(39, 72%, 15%)", r: 5 },
      { cx: 42.392304845413264, cy: 26, fill: "hsl(28, 72%, 15%)", r: 5 },
      { cx: 42.392304845413264, cy: 14, fill: "hsl(5, 72%, 35%)", r: 5 },
      { cx: 32, cy: 32, fill: "hsl(275, 72%, 35%)", r: 5 },
    ]);
  });
});
