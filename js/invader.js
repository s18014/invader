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

        const player = Player(this.gridX.center(), this.gridY.span(37)).addChildTo(this);

    }
});

phina.define("Player", {
    superClass: "Sprite",
    init: function (x, y) {
        this.superInit("nasu", 64, 64);
        this.setFrameIndex(10, 64, 64);
        this.x = x;
        this.y = y;
        this.SPEED = 5;
        this.bullet = null;
    },

    update: function (app) {
        const key = app.keyboard;

        if (key.getKey("left")) {
            this.x -= this.SPEED;
        }
        if (key.getKey("right")) {
            this.x += this.SPEED;
        }
        if (this.left < 0) this.left = 0;
        if (this.right > SCREEN_WIDTH) this.right = SCREEN_WIDTH;

        if (this.bullet == null && key.getKey("space")) {
            this.bullet = Bullet(this.x, this.top).addChildTo(this.parent);
        }
        if (this.bullet != null && this.bullet.isInvalid) {
            this.bullet.remove();
            this.bullet = null;
        }
    }
});

phina.define("Bullet", {
    superClass: "RectangleShape",
    init:  function (x, y) {
        this.superInit({
            width: 3,
            height: 15,
            fill: "white",
            stroke: null,
        });
        this.x = x;
        this.y = y;
        this.isInvalid = false;
        this.SPEED = 5;
    },

    update: function () {
        this.y -= this.SPEED;
        if (this.bottom < 0) this.isInvalid = true;
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