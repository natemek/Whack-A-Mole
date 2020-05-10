import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import LeadersJson from './leaders.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

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
      <button 
        variant="secondary"
        className={this.props.className} 
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

class Leaderboard extends React.Component {
  renderRow (num, username, score) {
    return (
      <tr key={num}>
        <td>{num}</td>
        <td>{username}</td>
        <td>{score}</td>
      </tr>
    );
  }
  render () {
    return (
      <Table striped bordered hover variant="secondary">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {this.props.leaders.map((leader) => 
            //console.log("num= ", leader.num, "user= ", leader.user, "score= ", leader.score))
            this.renderRow(leader.num, leader.user, leader.score))
          }
        </tbody>
      </Table>
      
    );
  }
}

class GameOver extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
    };
  }
  render () {
    return (
      <Modal show={this.props.show} onHide={() => (null)} animation="true">
        <Modal.Header>
          <Modal.Title>Game Over!</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button onClick={() => this.props.disapper()} variant="outline-success">
            Leave
          </Button>
          <Button onClick={() => {this.props.disapper();this.props.reset()}} variant="warning">
            Reset
          </Button>
        </Modal.Footer>
      </Modal>
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
      leaders: [[1,"@test", 20], [2,"@kgb", 18], [3,"@etj", 15]],
      score: 0,
      timeLeft: 5,
      show_alert: false,
      data: [],
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
        // alert('GAME OVER! Your final score is ' + this.state.score)
        // GameOver();
        this.setState({show_alert: true})
      }
    }, 1000)
  }

  resetGame () {
    if (this.state.timeLeft === 0) {
      this.setState({
        squares: Array(9).fill("square"),
        score: 0,
        timeLeft: 5
      })
      this.startTimer()
    }
  }

  async componentDidMount() {
    const url = "https://gist.githubusercontent.com/natemek/48328f5890efb975a2f7fdef990b0eb0/raw/a74af4b6a1f263a1ba62713e69636db299552787/leaders";
    const response = await fetch(url);
    const api_data = await response.json();
    this.setState({data: api_data})
    console.log(api_data)
  }

  render () {
    return (
      <div className="parent-div">
        
        <div className="page-header">
          <h1>Whack-A-Mole</h1>
        </div>

        <button type="button" className="btn btn-success" 
          onClick={() => this.startTimer()}>Start</button>
        <button type="button" className="btn btn-warning"
          onClick={() => {this.resetGame()}}> Reset </button>

        <h4 id="score">Score: {this.state.score}</h4>
        <div className="game">
          <h4 id="time-left">Seconds left: {this.state.timeLeft}</h4>
          
          <Board squares= {this.state.squares} scoreCounter= {(i) => this.scoreCounter(i)}/>
          <GameOver show= {this.state.show_alert} 
              disapper= {() => this.setState({show_alert:false})}
              reset= {() => this.resetGame()}/>
        </div>
        <div className="high-score-list">
          <h3>High Scores</h3>
          <Leaderboard leaders={this.state.data}/>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

export default Game;
