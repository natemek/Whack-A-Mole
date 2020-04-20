import React from 'react';
import ReactDOM from 'react-dom';
import HashMap from 'hashmap';
import './style.css';
import mole from './mole.jpg'

/**
 * Represents a single square component which can be rendered using
 * the square style or the mole style as defined in style.css
 * @param className can be either "square" or "mole"
 * @param id to identify each square
 * @param onClick a function triggered when square is clicked
 */
class Square extends React.Component {

  render () {
    return (
      <button className={this.props.className} 
        id={this.props.id} 
        onClick={() => this.props.onClick()}>
      </button>
    );
  }
}

/**
 * Represents 9 squares styled in a grid format
 * @param squares is an array which has the className for each
 * squares
 * @param scoreCounter is a function that gets triggered when
 * when squares are clicked
 */
class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        id={i}
        className={this.props.squares[i]}
        onClick={() => this.props.scoreCounter(i)}
      />
    );
  }

  render () {
    return (
      <div className="grid">
        {this.renderSquare(0)}
        {this.renderSquare(1)}
        {this.renderSquare(2)}

        {this.renderSquare(3)}
        {this.renderSquare(4)}
        {this.renderSquare(5)}

        {this.renderSquare(6)}
        {this.renderSquare(7)}
        {this.renderSquare(8)}
      </div>
    );
  }
}

/**
 * Game component has all the game functionalites and is parent to
 * Board
 */
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill("square"), //className for squares
      score: 0,
      timeLeft: 10,
    };
  }

  /**
   * Clears the board and randomly picks one square to be a mole
   */
  randomSquare()  {
    const sqs = Array(9).fill("square");
    let randomPosition = Math.floor(Math.random() * 8)
    console.log("Rand position = " + randomPosition)
    sqs[randomPosition] = "mole"
    this.hitPosition = randomPosition // hitPosition is used to increment score
    this.setState({squares: sqs});
  }

  /**
   * checks if the square id and the hitPosition are the same and
   * increments the score
   * @param {*} i is the id of a square or its index
   */
  scoreCounter(i) {
    if (i === this.hitPosition) {
      this.setState({score: this.state.score + 1})
    }
  }

  /**
   * creates an interval which counts down timeLeft to 0 and calls
   * randomSquare() every second. Once timeLeft reaches 0, it alerts
   * the user gameover and reports the final score
   */
  startTimer () {
    this.myInterval = setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.setState({
          timeLeft: this.state.timeLeft - 1
        })
        this.randomSquare()
      } else {
        clearInterval(this.myInterval)
        this.setState({squares: Array(9).fill("square")})
        alert('GAME OVER! Your final score is ' + this.state.score)
      }
    }, 1000)
  }

  resetGame () {
    this.setState({
      squares: Array(9).fill("square"),
      score: 0,
      timeLeft: 10
    })
    this.startTimer()
  }

  render () {
    return (
      <div className="center">
        <button onClick={() => this.resetGame()}>Reset</button>
        <button onClick={() => this.startTimer()}>Start</button>
        <h1>Whack-A-Mole</h1>

        <h4 id="score">Score: {this.state.score}</h4>

        <h4 id="time-left">Seconds left: {this.state.timeLeft}</h4>
        
        <Board squares= {this.state.squares} scoreCounter= {(i) => this.scoreCounter(i)}/>
        
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

export default Game;
