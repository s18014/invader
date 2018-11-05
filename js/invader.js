phina.globalize();

const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 640;
const ASSETS = {
    "image": {
        "buro": "./assets/images/buropiyo.png",
        "mero": "./assets/images/meropiyo.png",
        "mika": "./assets/images/mikapiyo.png",
        "nasu": "./assets/images/nasupiyo.png",
        "take": "./assets/images/takepiyo.png",
        "toma": "./assets/images/tomapiyo.png"
    }
};

phina.define("MainScene", {
    superClass: "DisplayScene",
    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });
        this.gridX = Grid(SCREEN_WIDTH, 40);
        this.gridY = Grid(SCREEN_HEIGHT, 40);

        this.backgroundColor = "black";

        const player = Sprite("nasu", 64, 64).addChildTo(this);
        player.setFrameIndex(10, 64, 64);
        player.x = this.gridX.center();
        player.y = this.gridY.span(37);
    }
});

phina.main(() => {
    const app = GameApp({
        title: "インベーダー",
        fps: 60,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        assets: ASSETS,
    });
    app.run();
});