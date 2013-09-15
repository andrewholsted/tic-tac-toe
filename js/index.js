$(document).ready(function(){

  function Game(options){
   
    this.board = new Board();
    this.active = true;

  }

  Game.prototype = {
    setup: function(){
      this.board.draw(3);
      this.board.listen();
    },

    reset: function(){

    }
  }

  function Board(){
    this.squares = [];
    this.canvas = $('#board');
    this.wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
  }

  Board.prototype = {
    draw: function(size){
      console.log(this);
      var canvas = this.canvas;
      var width = canvas.width();
      var context = canvas[0].getContext('2d');
      context.beginPath();
      //draw vertical lines
      context.moveTo(50,0);
      context.lineTo(50,150);
      context.moveTo(100,0);
      context.lineTo(100,150);

      //draw horizontal lines
      context.moveTo(0,50);
      context.lineTo(150,50);
      context.moveTo(0,100);
      context.lineTo(150,100);
      context.stroke();

      var size = size -1;
      var id = 0;
      var width = canvas.width()/3;
      var height = canvas.height()/3;

      for(i=0;i<=size;i++){
        for(j=0;j<=size;j++){
          this.squares.push(new Square(id++,width*j, height*i, canvas));
        }
      }
    },

    listen: function(callback){
      var squares = this.squares;
      var that = this;
      this.canvas.on('click', function(event){
        if(game.active){
          var offset = $(this).offset();
          x = event.pageX - offset.left;
          y = event.pageY - offset.top;
          $.each(squares, function(){
            var id = this.check_position(x,y);
            if(id >= 0){
              if(squares[id].value === null){
                that.movePlayer(this);
              }
            }
          });
        }
      });
    },

    getMoves: function(){
      var moves = [];
      for(i=0; i<this.squares.length;i++){
        if(this.squares[i].value === null){
          moves.push(this.squares[i].id);
        }
      }
      return moves;
    },

    isFull: function(){
      if (this.getMoves().length > 0){
        return false;
      }
      else{
        return true
      }
    },

    hasWinner: function() {
      var squares = this.squares;
      var wins = this.wins;
      for (var i = 0; i <= squares.length; i++) {
        if (squares[wins[i][0]].value === squares[wins[i][1]].value 
          && squares[wins[i][0]].value === squares[wins[i][2]].value 
          && squares[wins[i][0]].value != null) {
          game.active = false;
          return squares[wins[i][0]].value;
        }
      }
      return -1;
    },

    clear: function(){
      canvas[0].width = canvas[0].width;
    },

    movePlayer: function(square){
      var that = this;
      square.draw('X', function(){
        that.moveAI();
        that.isFull();
        that.hasWinner();
      });

    },

    moveAI: function(){
      //var bestMove = new Negamax();
      // bestMove.draw('O', function(){
      //   board.isFull();
      //   board.hasWinner();
      // });
    }
  };

  function Square(id,offsetX, offsetY, canvas) {
      this.id = id;
      this.value = null;
      this.canvas = canvas;
      this.xMin = offsetX;
      this.yMin = offsetY;
  }

  Square.prototype = {
    draw: function(shape, callback){
      var xMin = this.xMin;
      var yMin = this.yMin;
      var context = this.canvas[0].getContext('2d');
      if (shape == 'X') {
        context.beginPath();
        //draw first diagonal
        context.moveTo(xMin+5,yMin+5);
        context.lineTo(xMin+45,yMin+45);

        //draw second diagonal
        context.moveTo(xMin+45,yMin+5);
        context.lineTo(xMin+5,yMin+45);
        
        context.stroke();
        this.empty = false;
        this.value = 'X';
        callback();
      }
      else if (shape == 'O'){
        //I can draw circles
        context.beginPath();
        context.arc(xMin+25,yMin+25,20,20,Math.PI*2,true);
        context.stroke();
      }
    },

    check_position: function(x,y){

      //get which square we clicked on
      var xMax = this.xMin + 50;
      var yMax = this.yMin + 50;
      if ((x >= this.xMin && x <= xMax) && (y >= this.yMin && y <= yMax)){
        return this.id;
      }
    }
  }


  var game = new Game();
  game.setup();
});

