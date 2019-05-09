//Elemento Canvas
var cnv = document.getElementById('canvas');

//Dando um contexto de renderização 2D ao elemento Canvas
var ctx = cnv.getContext('2d');

//Recursos utilizados no jogo

    //Variável global construtora
    var global = function (oriX,oriY,width,height,x,y) {
        this.oriX = oriX;
        this.oriY = oriY;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }

    //Retorna ponto central no eixo X
    global.prototype.centerX = function(){
        return this.x + (this.width/2);
    }

    //Retorna ponto central no eixo Y
    global.prototype.centerY = function(){
        return this.y + (this.height/2);
    }

    global.prototype.halfWidth = function() {
        return this.width/2;
    }

    global.prototype.halfHeight = function() {
        return this.height/2;
    }

    //Criação da class zumbi
    var Zombie = function (oriX,oriY,width,height,x,y) {
        global.call(this,oriX,oriY,width,height,x,y);
        this.normal = 1;
        this.dead = 2;
        this.speed = 3;
        this.state = this.normal;
    }

    Zombie.prototype = Object.create(global.prototype);

    Zombie.prototype.deadG = function () {
        this.oriX = 120;
        this.oriY = 0;
        this.width = 23;
        this.height = 23;
    }


    //Arrays utilizados
        //Contem informações do jogo
        var game = [];

        //Contem informações dos zumbis
        var zombies = [];

        //Variaveis de frequência e tempo
        var zombieFreq = 100;
        var zombieTimer = 0;


        //Recursos que vão ser carregados
        var resLoad = [];

        //Contem as informações do tiro
        var shoots = [];

    //Elementos do jogo
        //Fundo
        var background = new global(0,50,720,480,0,0);
        game.push(background);

        //Jogador
        var player = new global(0,0,30,42,360,438);
        game.push(player);

        //Press Enter
        var pressEnter = new global(250, 0, 135, 45, 300, (cnv.height/2)-45);
        game.push(pressEnter);

        //Paused
        var pressPaused = new global(190, 0, 40, 45, 350, (cnv.height/2)-45);

        //GameOver
        var gameOver = new global(400, 0, 105, 45, 330, (cnv.height/2)-45);

    //Imagens do jogo
    var img = new Image();
    //Evento de carregamento da imagem
    img.addEventListener('load',loadImage,false);
    img.src = 'folha.png';
    //Adiciona a imagem em "Recursos que vão ser carregados"
    resLoad.push(img);

    //Contador de recursos carregados
    var resLoaded = 0;


    //Entradas do jogador
    var right = 39;
    var left = 37;
    var space = 32;
    var enter = 13;

    //Ações do jogador
    var movLeft = false;
    var movRight = false;
    var shoot = false;
    var spacePress = false;
    var gamOver = false;

    //Carregando
    var loading = 0;

    //Jogando
    var playing = 1;

    //Pausado
    var paused = 2;

    //Terminado
    var over = 3;

    //Estado do jogo
    var gameState = loading;

    //Evento para ver se o jogador apertou a tecla
    window.addEventListener("keydown", keydownHandler);

    //Evento para ver se o jogador soltou a tecla
    window.addEventListener("keyup", keyupHandler);

//Funções do jogo
    //Função para mover jogador assim que ele pressionar a tecla
    function keydownHandler(e){
        var key = e.keyCode;
        switch (key) {
            case left:
                movLeft = true;
                movRight =false;
                break;
            case right:
                movRight = true;
                movLeft =false;
                break;
            case enter:

                if(gameState !== playing){
                    gameState = playing;

                    removeObject(pressEnter,game);
                    removeObject(pressPaused,game);
                }
                else {
                    game.push(pressPaused);
                    gameState = paused;
                }
                break;
            case space:
                //Verifica se a tecla espaço está pressionada
                //caso esteja e não esteja disparando o tiro ela irá disparar
                if (!spacePress) {
                    //Inicia o tiro
                    shoot = true;
                    spacePress = true;
                }
                break;
        }
    }

    //Função para parar o jogador assim que ele solta a tecla
    function keyupHandler(e){
        var key = e.keyCode;
        switch (key) {
            case left:
                movLeft = false;
                break;
            case right:
                movRight = false;
                break;
            case space:
                //Verifica se a tecla espaço não está pressionada
                //caso esteja e não esteja disparando o tiro ela irá disparar
                if (spacePress) {
                    spacePress = false;
                }
                break;
        }
    }

    //Função contadora de recursos carregados
    function loadImage() {
        resLoaded++;
        if(resLoaded === resLoad.length) {
        //remove o evento que carrega os elementos
        img.removeEventListener('load',loadImage,false);
        gameState = paused;
        }
    }

    //Função para a movimentação do jogador
    function movPlayer() {
        //Move o jogador para a esquerda
        if (movLeft) {
            player.vx = -7;
        }
        //Move o jogador para a direita
        if (movRight) {
            player.vx = 7;
        }

        //Não move o jogador
        if(!movRight && !movLeft){
            player.vx =0;
        }

        //Faz o disparo
        if(shoot){
            fire();
            shoot = false;
        }

        //Atualiza a posição dos disparos
        for(var i in shoots){
            var sht = shoots[i];
            sht.y += sht.vy;
            if(sht.y < -sht.height){
                removeObject(sht,shoots);
                removeObject(shoots,game);
                i--;
            }
        }


        //Atualiza a posição do jogador
        player.x = Math.max(70,Math.min((cnv.width - 70) - player.width, player.x + player.vx));
    }

    //Função de tempo para criação dos zumbis
    function timer() {
        //Aumenta o tempo do timer
        zombieTimer++;

        //Criação dos zumbis
        if (zombieTimer === zombieFreq) {
            makeZombie();
            zombieTimer = 0;
            //Ajustar a frequência para não criar um grande número de zumbis
            if (zombieFreq > 10) {
                zombieFreq--;
            }
        }
        //Atualiza a posição dos zumbis
        for (var i in zombies) {
            var zombie = zombies[i];
            if (zombie.state !== zombie.dead) {
                zombie.y += zombie.vy;
            }

            if(zombie.y > cnv.height - zombie.height) {
                gameState = over;
                gamOver = true;
            }

            for(var j in shoots) {
                var shoot = shoots[j];
                if(collide(shoot, zombie) && zombie.state !== zombie.dead){
                    killZombie(zombie);

                    removeObject(shoot,shoots);
                    removeObject(shoot,game);
                    j--;
                    i--;
                }
            }
        }
    }
    
    //Função de criação de zumbis
    function makeZombie() {
        var zombiePosX = Math.floor(Math.random()*555) + 65;

        var zombie = new Zombie(54,0,30,43,zombiePosX,0);
        zombie.vy = 2;

        game.push(zombie);
        zombies.push(zombie);
    }
    
    function killZombie(zombie) {
        zombie.state = zombie.dead;
        zombie.deadG();
        setTimeout(function () {
            removeObject(zombie,zombies);
            removeObject(zombie,game);
        },1000);
    }

    //Função de criação dos tiros
    function fire() {
        var sht = new global(150, 0, 10,14, player.centerX() + 5, player.y +1 );
        sht.vy = -5;
        game.push(sht);
        shoots.push(sht);
    }

    //Função de colisão
    function collide(o1,o2) {
        var hit = false;

        //Calculo da distancia entre dois objetos
        var vetX = o1.centerX()- o2.centerX();
        var vetY = o1.centerY()- o2.centerY();

        //Armazena dados da soma dos objetos
        var sumHWidth = o1.halfWidth() + o2.halfWidth();
        var sumHHeight =  o1.halfHeight() + o2.halfHeight();

        //verifica a colisão
        if(Math.abs(vetX) < sumHWidth && Math.abs(vetY) < sumHHeight){
            hit = true;
        }
        return hit;
    }

    //Função de loop
    function loop() {
        requestAnimationFrame(loop, cnv);
        //Define o que vai acontecer com base no estado do jogo
        switch(gameState){
            case loading:
                break;
            case playing:
                update();
                break;
            case over:
                enter = 50;
                if(gamOver){
                    game.push(gameOver);
                    gamOver = false;
                }
                setTimeout(function () {
                    location.reload();
                },3000);
                break;
        }
        render();
    }

    //Função que remove os objetos
    function removeObject(objR,array) {
        var i = array.indexOf(objR);
        if(i !== -1){
            array.splice(i,1);
        }
    }
    
    //Função de atualização dos elementos
    function update() {
        movPlayer();
        timer();
    }

    //Função para desenhar os elementos do jogo
    function render() {
        //Limpa a tela
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        //Desenha caso tenha algum elemento dentro do jogo
        if(game.length !== 0){
            for(var i in game){
                var gam = game[i];
                ctx.drawImage(img, gam.oriX, gam.oriY, gam.width, gam.height, Math.floor(gam.x), Math.floor(gam.y), gam.width, gam.height);
            }
        }
    }

    loop();