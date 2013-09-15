$(document).ready(function(){

  function Game(options){
    var defaultOptions = {
      size: 3
    };
    
    if (typeof options == 'object') {
      var options = $.extend(defaultOptions, options);
    } 
    else {
      var options = defaultOptions;
    }

    var player1 = new Player('Human');
    var player2 = new Player('AI');
    var board = new Board();
    var turns = 0;

    this.setup = function(){
      board.draw(options.size);
      board.listen();
    };

    this.end = function(){

    };

    this.win = function(){

    };

    this.is_over = function(){

    };

    this.reset = function(){

    };

    this.step = function(square){
      if (turns % 2 == 0){
        player1.move(square, function(){
          if (player2.type == "AI"){
            turns++;
            game.step();
          }
          else {
            turns++;
          }
        });
      }
      else {
        player2.move(square);
        turns++;
      }
    }

  }

  function Board(){
    var squares = [];
    var that = this;
    var canvas = $('#board');
    this.draw = function(size){
      
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
          squares.push(new Square(id++,width*j, height*i));
        }
      }
    }

    this.listen = function(callback){
      canvas.on('click', function(event){
        var offset = $(this).offset();
        x = event.pageX - offset.left;
        y = event.pageY - offset.top;
        $.each(squares, function(){
          var id = this.check_position(x,y);
          if(id >= 0){
            if(squares[id].is_empty){
              game.step();
            }
          }
        });
      });
    };

    var clear = function(){

    }

  };

  function Square(id,offsetX, offsetY) {
      var id = id;
      var value = null;
      var empty = true;
      var xMin = offsetX;
      var yMin = offsetY;

      this.draw = function(canvas, shape){
        if (shape == 'X') {

        }
        else if (shape == 'O'){

        }
      }

      this.check_position = function(x,y){
        var xMax = offsetX + 50;
        var yMax = offsetY + 50;
        if ((x >= xMin && x <= xMax) && (y >= yMin && y <= yMax)){
          return id;
        }
      }

      this.is_empty = function(){
        if (empty == true) {
          return true;
        }
        else {
          return false;
        }
      }

  }

  function Player(type){
   this.type = type;
    this.move = function(square, callback){
      if(type == 'Human') {
        alert("human moved!");
        callback();
      }
      else if(type == 'AI'){
        alert('AI moved!');
      }
    }
  }

  var game = new Game();
  game.setup();
});

