$(document).ready(function(){
  
  function Game(options){
    this.board = new Board();
    this.active = true;
  }

  Game.prototype = {

    setup: function(options){
      this.currentPlayer = options.player;
      this.computer = options.computer;
      this.board.draw();
    },

    step: function(){

      // check for winner
      var winner = this.board.hasWinner();
      if (winner === 'X' || winner == 'O') {
        alert (winner + ' wins');
        game.active = false;
      }

      // no winner, check if board is full
      else if (this.board.isFull()) { 
        alert('it\'s a tie..');
      }

      // board isn't full, carry on
      else { 

        // if the last player to move was X, make it O and vice versa
        game.currentPlayer = (game.currentPlayer === 'X') ? 'O' : 'X';

        // check if it's the computers turn
        if (game.currentPlayer === game.computer) {

          // find the computer's best move with Negamax
          var move = this.board.solver.solve(this.board, game.currentPlayer);
          
          this.board.move(move, game.currentPlayer);

          // draw the move on the canvas
          this.board.squares[move].draw(game.currentPlayer);
      
          // step it up
          this.step();
        }
      }
    }
  }

  function Board(){

    this.solver = new Negamax();

    this.board = [0,0,0,0,0,0,0,0,0];
    this.squares = [];
    this.canvas = $('#board');

    // all possible winning combinations
    this.wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    // this is only used when we load the board during our Negamax calls
    if (arguments.length > 0) {
      for (var i = 0; i < 9; i++) {
        this.board[i] = arguments[0][i];
      }   
    }
  }


  Board.prototype = {

    //draw the board
    draw: function(){

      var context = this.canvas[0].getContext('2d');
      var width = this.canvas.width();
      var oneThird = width/3;
      var twoThirds = (width*2)/3;
      
      context.beginPath();

      // draw vertical lines relative to canvas size
      context.moveTo(oneThird,0);     
      context.lineTo(oneThird,width); 

      context.moveTo(twoThirds,0);   
      context.lineTo(twoThirds,width); 

      // draw horizontal lines relative to canvas size
      context.moveTo(0,oneThird);     
      context.lineTo(width,oneThird);

      context.moveTo(0,twoThirds);   
      context.lineTo(width,twoThirds);

      context.stroke();

      var id = 0;
      for(i=0;i<=2;i++){
        for(j=0;j<=2;j++){
          this.squares.push(new Square(id++,oneThird*j, oneThird*i, this.canvas));  // (id, width, height, canvas)
        }
      }

      // attach our canvas event listener
      this.listen();
    },

    listen: function(callback){
      var that = this;
      var squares = that.squares;
      
      this.canvas.on('click', function(event){
        
        if(game.active){

          //get the x,y position of our mouse click relative to the canvas
          var offset = $(this).offset();
          x = event.pageX - offset.left;
          y = event.pageY - offset.top;

          // find which square we clicked on
          $.each(squares, function(){
            var id = this.checkPosition(x,y);
            if(id >= 0){
              // make sure it's empty square is empty
              if(that.board[id] === 0){

                // make the move, draw it on the canvas, and step the game
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
      for (var i = 0; i < this.board.length; i++) {
        if (this.board[i] === 0)
          moves.push(i);
      }
      return moves;
    },

    isFull: function() {
      for(var i = 0; i < this.board.length; i++) {
        if (this.board[i] === 0)
          return false;
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
    this.width = canvas.width()/3;
    this.context = canvas[0].getContext('2d');
    this.xMin = offsetX;
    this.yMin = offsetY;
  }

  Square.prototype = {

    draw: function(shape){
      var w = this.width;
      var xMin = this.xMin;
      var yMin = this.yMin;
      var maxOffset = (w*.85);
      var minOffset = (w*.15);
      var context = this.context;
      if (shape == 'X') {
        //draw X

        context.beginPath();
       
        context.moveTo(xMin+minOffset,yMin+minOffset);
        context.lineTo(xMin+maxOffset,yMin+maxOffset);

        context.moveTo(xMin+maxOffset,yMin+minOffset);
        context.lineTo(xMin+minOffset,yMin+maxOffset);
        
        context.strokeStyle = '#777777';
        context.stroke();

      }

      else if (shape == 'O'){

        // draw O

        context.beginPath();

        context.arc(xMin+(w/2),yMin+(w/2),w/2.6,w/2.6,Math.PI*2,true);

        context.strokeStyle = '#777777';
        context.stroke();
      }
    },

    checkPosition: function(x,y){
      //get which square we clicked on
      var xMax = this.xMin + (this.width-1);
      var yMax = this.yMin + (this.width-1);
      if ((x >= this.xMin && x <= xMax) && (y >= this.yMin && y <= yMax)){
        return this.id;
      }
    }
  }

  // Negamax
  // Inspired by http://mkuklis.github.io/tictactoe/docs/tictactoe.html

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
    var size = $('#board').width();
    $('#board').remove();
    $('#container').prepend($("<canvas id='board' width='"+size+"' height='"+size+"'></canvas>"))
    
    game = new Game();
    game.setup({
      computer:'O',
      player: 'X',
      size: 3,
    });
    
  });
});

