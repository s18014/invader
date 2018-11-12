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

const ENEMY_ASSETS = [
    "buro", "mero", "mika", "nasu", "take", "toma"
];

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
        this.time = 0;
        this.enemyInterval = 2000;

        this.player = Player(this.gridX.center(), this.gridY.span(37)).addChildTo(this);
        this.enemyGroup = EnemyGroup().addChildTo(this);
        for (x=4; x<16; x++) {
            for (y=1; y<8; y++) {
                this.enemyGroup.addChild(Enemy(this.gridX.span(x * 2), this.gridY.span(y * 3), ENEMY_ASSETS[(x + y) % 5]));
            }
        }
    },
    update: function (app) {
        if (this.player.bullet != null) {
            this.enemyGroup.children.some(enemy => {
                if (enemy.hitTestElement(this.player.bullet)) {
                    this.player.bullet.flare('hit');
                    enemy.flare('hit');
                    return true;
                }

                return false;
            });
        }
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
            this.bullet = null;
        }
    }
});

phina.define("Enemy", {
    superClass: "Sprite",
    init: function (x, y, image) {
        this.superInit(image, 64, 64);
        this.setFrameIndex(7, 64, 64);
        this.x = x;
        this.y = y;
    },
    onhit: function () {
        this.remove();
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
        this.SPEED = 50;
    },

    onhit: function () {
        this.remove();
        this.isInvalid = true;
    },

    update: function () {
        this.y -= this.SPEED;
        if (this.bottom < 0) this.flare("hit");
    }
});

phina.define("EnemyGroup", {
    superClass: "DisplayElement",
    init: function () {
        this.superInit();
        this.time = 0;
        this.interval = 200;
        this.direction = 1;
    },

    update: function (app) {
        this.time += app.deltaTime;
        const scene = this.parent;
        let right = 0;
        let left = scene.gridX.columns;

        if (this.time / this.interval >= 1) {
            this.children.forEach(enemy => {
                enemy.moveBy(scene.gridX.unit() * this.direction, 0);
                right = Math.max(right, enemy.x / scene.gridX.unit());
                left = Math.min(left, enemy.x / scene.gridX.unit());
            });

            this.time -= this.interval;
        }

        if (this.direction > 0 && right >= 38
            || this.direction < 0 && left <= 2) {
            this.direction = -this.direction;
        }
    },
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