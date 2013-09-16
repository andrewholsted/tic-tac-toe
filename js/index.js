$(document).ready(function(){
  
  function Game(options){
    this.board = new Board();
    this.active = true;
  }

  Game.prototype = {
    setup: function(options){
      this.currentPlayer = options.player;
      this.computer = options.computer;
      this.board.draw(options.size);
    },

    step: function(){
      // check to see if we have a winner
      var winner = this.board.hasWinner();
      if (winner === 'X' || winner == 'O') {
        alert (winner + ' wins');
        game.active = false;
      }

      // no winner so check to see if board is full
      else if (this.board.isFull()) { 
        alert('it\'s a tie..');
      }

      // board isn't full so the game continues
      else { 

        // if the last player to move was X, make it O and vice versa
        game.currentPlayer = (game.currentPlayer === 'X') ? 'O' : 'X';

        //if new player is the computer, let's find the best move
        if (game.currentPlayer === game.computer) {

          //next best move
          var move = this.board.solver.solve(this.board, game.currentPlayer);
          
          //let's move there behind the scenes
          this.board.move(move, game.currentPlayer);

          //and draw it to the canvas
          this.board.squares[move].draw(game.currentPlayer);
      
          //step forward
          this.step();
        }
    }
    }
  }

  function Board(){

    this.solver = new Negamax();

    //simple board to work with behind the scenes
    this.board = [0,0,0,0,0,0,0,0,0];

    //setup our canvas squares
    this.squares = [];
    this.canvas = $('#board');

    //possible winning combinations
    this.wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    // this if for when we load the new board in the Negamax
    if (arguments.length > 0) {
      for (var i = 0; i < 9; i++) {
        this.board[i] = arguments[0][i];
      }   
    }
  }

  Board.prototype = {

    //draw the initial board
    draw: function(){
      var canvas = this.canvas;
      var context = canvas[0].getContext('2d');
      var width = canvas.width();
      context.beginPath();

      // draw vertical lines
      context.moveTo(width/3,0);     //width * .3  , 0
      context.lineTo(width/3,width);   //width * .3 , width
      context.moveTo((width*2)/3,0);    //width * .6 , 0
      context.lineTo((width*2)/3,width);  // width *.6, width

      // draw horizontal lines
      context.moveTo(0,width/3);     //0, width * .3
      context.lineTo(width,width/3);   // width, width *.3
      context.moveTo(0,(width*2)/3);    //0 , width *.6
      context.lineTo(width,(width*2)/3);  //width, width *.6
      context.stroke();

      var id = 0;
      var width = width/3;
      var height = width;
      for(i=0;i<=2;i++){
        for(j=0;j<=2;j++){
          this.squares.push(new Square(id++,width*j, height*i, canvas));
        }
      }

       this.listen();
    },

    // setup out click listener for the board
    listen: function(callback){

      var squares = this.squares;
      var that = this;

      this.canvas.on('click', function(event){
        
        // allow clicks if the game is active
        if(game.active){

          //get the position of our mouse click
          var offset = $(this).offset();
          x = event.pageX - offset.left;
          y = event.pageY - offset.top;

          // loop through our squares and see which one we clicked on
          $.each(squares, function(){
            var id = this.check_position(x,y);
            if(id >= 0){
              // check that the square is empty
              if(that.board[id] === 0){

                // make the move, draw it on the board, and step the game
                that.move(id, game.currentPlayer);
                this.draw(game.currentPlayer);
                game.step();
              }
            }
          });
        }
      });
    },

    getMoves: function() {
      var moves = [];
      for (var i = 0; i < 9; i++) {
        if (this.board[i] === 0) {
          moves.push(i);
        }
      }
      return moves;
    },

    isFull: function() {
      for(var i = 0; i < 9; i++) {
        if (this.board[i] === 0) {
          return false;
        }
      }
      return true;
    },

    getSquare: function(index) {
      return this.board[index];
    },

    move: function(index, player) {
      this.board[index] = player;
    },

    copy: function(){
      return new Board(this.board);
    },
    hasWinner: function() {
      this.w = this.wins;
      this.s = this.getSquare;
      for (var i = 0; i < 8; i++) {
        if (this.s(this.w[i][0]) === this.s(this.w[i][1]) 
          && this.s(this.w[i][0]) === this.s(this.w[i][2]) 
          && this.s(this.w[i][0]) != 0) {
          return this.s(this.w[i][0]);

        }
      }
      return -1;
    },
  };

  function Square(id,offsetX, offsetY, canvas) {
      this.id = id;
      this.value = null;
      this.squareWidth = canvas.width()/3;
      this.canvas = canvas;
      this.xMin = offsetX;
      this.yMin = offsetY;
  }

  Square.prototype = {
    draw: function(shape){
      var xMin = this.xMin;
      var yMin = this.yMin;
      var maxOffset = (this.squareWidth*.85);
      var minOffset = (this.squareWidth*.15);
      var context = this.canvas[0].getContext('2d');
      if (shape == 'X') {
        context.beginPath();
        //draw first diagonal
        context.moveTo(xMin+minOffset,yMin+minOffset);
        context.lineTo(xMin+maxOffset,yMin+maxOffset);

        //draw second diagonal
        context.moveTo(xMin+maxOffset,yMin+minOffset);
        context.lineTo(xMin+minOffset,yMin+maxOffset);
        
        context.stroke();
        this.empty = false;
        this.value = 'X';
      }
      else if (shape == 'O'){
        //I can draw circles
        context.beginPath();
        context.arc(xMin+(this.squareWidth/2),yMin+(this.squareWidth/2),this.squareWidth/2.6,this.squareWidth/2.6,Math.PI*2,true);
        context.stroke();
        this.value = 'O';
      }
    },

    check_position: function(x,y){
      //get which square we clicked on
      var xMax = this.xMin + (this.squareWidth-1);
      var yMax = this.yMin + (this.squareWidth-1);
      if ((x >= this.xMin && x <= xMax) && (y >= this.yMin && y <= yMax)){
        return this.id;
      }
    }
  }

  // Negamus Maximus

  //Inspired by http://mkuklis.github.io/tictactoe/docs/tictactoe.html

var Negamax = function(maxDepth) {
    this.INFINITY = 999,
    this.maxDepth = maxDepth,
    this.bestmove = -1;
  }

  Negamax.prototype = {

    _solve: function(board, player, depth) {

    // Captain, we have reached maximum depth

      if (depth > this.maxDepth) {
        return 0;
      }
    
      var opponent = (player == 'X') ? 'O' : 'X',
        winner = board.hasWinner();

      if (winner === player) {
        return this.INFINITY;
      }
      else if (winner === opponent) {
        return -1 * this.INFINITY;
      }

      else if (board.isFull()) {
        return 0;
      }
      

      var moves = board.getMoves(),
        alpha = -1 * this.INFINITY,

        bestmoves = [];
        
      for (var i = 0, len = moves.length; i < len; i++) {
        newboard = board.copy();
        newboard.move(moves[i], player);

        var subalpha = -1 * this._solve(newboard, opponent, depth + 1);
        if (alpha < subalpha) {
          alpha = subalpha;
        }
      
        if (depth === 0) {
          bestmoves.push(subalpha);
        }
      }


      if (depth === 0) {
        var candidates = [];
        for (var i = 0, len = bestmoves.length; i < len; i++) {
          if (bestmoves[i] === alpha) {
            candidates.push(moves[i]);
          }
        }

        this.bestmove = candidates[0];
      }
   
      return alpha;
    },

    //solve this bitch

    solve: function(board, player) {
      this.bestmove = -1;
      var alpha = this._solve(board, player, 0);
      return this.bestmove;
    }
  }

  var game = new Game();
  game.setup({
    computer:'O',
    player: 'X',
    size: 3
  });

  $('#new-game').on('click', function(){
    $('#board').remove();
    $('#container').prepend($("<canvas id='board' width='150' height='150'></canvas>"))
    game = new Game();
    game.setup({
      computer:'O',
      player: 'X',
      size: 3,
    });

  });
});

