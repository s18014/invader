phina.globalize();

const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 640;
let SCORE = 0;
let GAME_STATUS = "";
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
        this.backgroundColor = "#111";

        this.player = Player(this.gridX.center(), this.gridY.span(37)).addChildTo(this);
        this.enemyGroup = EnemyGroup(this, 7, 5, 2, 4).addChildTo(this);
        this.enemyGroup.allMoveTo(this.gridX.center() - this.gridX.span(this.enemyGroup.column * this.enemyGroup.gapX) / 2, this.gridY.span(5));
        this.missileGroup = DisplayElement().addChildTo(this);
    },

    update: function (app) {
        // ゲームクリア判定
        if (this.enemyGroup.children.length <= 0) {
            SCORE += 1500;
            GAME_STATUS = "GAME CLEAR"
            this.exit();
        }
        // 敵とプレイヤーの当たり判定
        if (this.player != null) {
            this.enemyGroup.children.some(enemy => {
                if (enemy.hitTestElement(this.player) && enemy.parent != null) {
                    this.player.flare('hit');
                    GAME_STATUS = "GAME OVER"
                    this.exit();
                }
            });
        }
        // ミサイルと弾の当たり判定
        if (this.player.bullet != null && this.player.parent != null) {
            this.missileGroup.children.some(missile => {
                if (missile.hitTestElement(this.player.bullet)) {
                    missile.flare("hit");
                    this.player.bullet.flare("hit");
                }
            });
        }
        // 敵と弾の当たり判定
        if (this.player.bullet != null) {
            this.enemyGroup.children.some(enemy => {
                if (enemy.hitTestElement(this.player.bullet)) {
                    this.player.bullet.flare('hit');
                    enemy.flare('hit');
                    SCORE += 100;
                    return true;
                }
            });
        }
        // ミサイルとプレイヤーの当たり判定
        this.missileGroup.children.some(missile => {
            if (missile.hitTestElement(this.player) && this.player.parent != null) {
                missile.flare("hit");
                this.player.flare("hit");
                GAME_STATUS = "GAME OVER"
                this.exit();
            }
        });
    }
});

phina.define("ResultScene", {
    superClass: "ResultScene",
    init: function () {
        this.superInit({
            score: SCORE,
            message: GAME_STATUS,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT
        });
        SCORE = 0;
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
    },

    onhit: function () {
        this.remove();
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

phina.define("Missile", {
    superClass: "PathShape",
    init: function (x, y) {
        this.superInit({
            paths: [
                {x: 0, y: 4},
                {x: 3, y: 8},
                {x: -3, y: 12},
                {x: 3, y: 16},
                {x: -3, y: 20},
                {x: 0, y: 24},
            ],
            fill: null,
            stroke: "yellow",
            lineJoin: "miter",
            strokeWidth: 1
        });
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 24;
        this.SPEED = 3;
    },
    onhit: function () {
        this.remove();
    },
    update: function () {
        this.y += this.SPEED;
        if (this.top > SCREEN_HEIGHT) {
            this.flare("hit");
        }
    },
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
    init: function (scene, column, row, gapX, gapY) {
        this.superInit();
        this.column = column;
        this.row = row;
        this.gapX = gapX;
        this.gapY = gapY;
        this.make(scene, column, row, gapX, gapY);
        this.time = 0;
        this.beginInterval = 1000;
        this.interval = 1000;
        this.maxAmountOfEnemy = this.children.length;
        this.existRatio = 1;
        this.direction = 1;
        this.attackInterval = 200;
        this.isOnWall = false;
    },

    update: function (app) {
        this.interval = this.children.length / this.maxAmountOfEnemy * this.beginInterval;
        this.time += app.deltaTime;
        const scene = this.parent;
        let right = 0;
        let left = scene.gridX.columns;


        if (this.isOnWall && this.time / this.interval >= 0.5) {
            this.children.forEach(enemy => {
                enemy.moveBy(0, scene.gridY.unit() * 2);
            });
            this.isOnWall = false;
        }

        if (this.time / this.interval >= 1) {
            this.children.forEach(enemy => {
                enemy.moveBy(scene.gridX.unit() * this.direction, 0);
                right = Math.max(right, enemy.x / scene.gridX.unit());
                left = Math.min(left, enemy.x / scene.gridX.unit());
            });
            this.time -= this.interval;
        }

        if (app.frame % this.attackInterval == 0) {
            this.shot();
        }


        if (this.direction > 0 && right >= 38
            || this.direction < 0 && left <= 2) {
            this.direction = -this.direction;
            this.isOnWall = true;

        }
    },

    make: function (scene, column, row, gapX, gapY) {
        for (x=0; x<column; x++) {
            for (y=0; y<row; y++) {
                this.addChild(Enemy(scene.gridX.span(x * gapX), scene.gridY.span(y * gapY), ENEMY_ASSETS[(x) % 5]));
            }
        }

    },

    allMoveTo: function (gridX, gridY) {
        var distX = this.x + gridX;
        var distY = this.y + gridY;
        this.children.forEach(enemy => {
            enemy.moveBy(distX, distY);
        });
    },

    shot: function () {
        var attackableEnemys = {};
        var enemys = [];
        var enemy = null;
        this.children.forEach(enemy => {
            attackableEnemys[enemy.x] = enemy;
        });

        for (key in attackableEnemys) {
            enemys.push(attackableEnemys[key]);
        }
        enemy = enemys[Math.floor(Math.random() * enemys.length)];
        Missile(enemy.x, enemy.y).addChildTo(this.parent.missileGroup);
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