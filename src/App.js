import React from 'react';
import ReactDOM from 'react-dom';
import Parse from 'parse/node';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import config from './config';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Initialize parse to connect back4app
Parse.initialize(config.APP_KEY, config.JS_KEY);
Parse.serverURL = "https://parseapi.back4app.com/";


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

class Leader extends React.Component {

  render () {
    return (
      <>
        <tr key={this.props.id}>
          <td>{this.props.num}</td>
          <td>{this.props.username}</td>
          <td>{this.props.score}</td>
        </tr>
      </>
    );
  }
}

class Leaderboard extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      leaders: [],
    };
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
          {
            this.props.leaders.map((leader, index) => {
              return (
                <Leader key={leader[0]}   
                        num= {index + 1}
                        id= {leader[0]}
                        username= {leader[1]}
                        score= {leader[2]}/>
              );
            })
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
      username: "",
    };
  }
   
  checkHighScore() {
    if (this.props.score > this.props.highscore) {
      return (
        <Modal.Title>
          <span role="img" aria-label="confetti">🎉HIGHSCORE 🎉</span> You Scored {this.props.score}
        </Modal.Title>
      );
    } else {
      return (
        <Modal.Title>Game Over! You Scored {this.props.score}</Modal.Title>
      );
    }
  }

  render () {
    return (
      <>
      <Modal show={this.props.show} onHide={() => (null)} animation="true">
        <Modal.Header>
          {this.checkHighScore()}
        </Modal.Header>
        <Row>
          <Col xs={9}>
            <Form onSubmit={(e) => {
                  try {
                    e.preventDefault();
                    this.props.resetGame();
                    this.props.disapper();
                    this.props.addLeader(this.state.username, this.props.score);
                    this.setState({username: ""});
                  } catch (error) {
                    console.log(error);
                  }
                }}>
              
                <Form.Control
                  type="text"
                  placeholder="Username"
                  aria-describedby="inputGroupPrepend"
                  name="username"
                  value={this.state.username}
                  onChange={(event) => {
                    this.setState({username: event.target.value});
                  }}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a username.
                </Form.Control.Feedback>
              
            </Form>
          </Col>
          <Col>
            <Button variant="primary" 
                    type="submit"
                    onClick={() => {
                      try {
                        this.props.resetGame();
                        this.props.disapper();
                        this.props.addLeader(this.state.username, this.props.score);
                        this.setState({username: ""});
                      } catch (error) {
                        console.log(error);
                      }
                    }}>
              Submit
            </Button>
          </Col>
        </Row>
        <Modal.Footer>
          <Button className="score-form-Leave" 
                  onClick={() => {
                    this.props.disapper();
                    this.props.resetGame();
                  }}   
                  variant="outline-success">
            Leave
          </Button>
        </Modal.Footer>
      </Modal>
      </>
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
      squares: Array(9).fill("square"), //className for squares,
      score: 0,
      timeLeft: 5,
      show_alert: false,
      leaders: [],
      highscore: 0,
    };
  }

  /**
   * Clears the board and randomly picks one square to be a mole
   */
  randomSquare()  {
    const sqs = Array(9).fill("square");
    let randomPosition = Math.floor(Math.random() * 8)
    // console.log("Rand position = " + randomPosition)
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
    this.resetGame();
    this.myInterval = setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.setState({
          timeLeft: this.state.timeLeft - 1
        })
        this.randomSquare()
      } else {
        clearInterval(this.myInterval)
        this.hitPosition = -1;
        this.setState({squares: Array(9).fill("square"), show_alert: true})
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
    }
  }

  // This code is for using expressapi and mongo
  // async addLeader(username, score) {
  //   console.log("add leader just got called with", username, " -> ", score);
  //   const url = `/api/leaders/`;
  //   const response = await fetch(url, {
  //     method: 'post',
  //     body: JSON.stringify({username: username, score: score}),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     }
  //   });
  //   const api_data = await response.json();
  //   this.setState({leaders: []});
  //   console.log("%%%%", api_data);
  //   await api_data.forEach((obj) => {
  //     const mapData = async () => {
  //       this.setState(state => {
  //         const leaders = [...state.leaders, [obj._id, obj.username, obj.score] ];
  //         return {
  //           leaders,
  //         };
  //       })
  //     }
  //     mapData();
  //   })

  // }
  
  async addLeader(username, score) {
    if (this.state.highscore < score) { this.setState({highscore: score}); }
    try {
      const Leader = Parse.Object.extend('Leader');
      const leader = new Leader();
      leader.set("username", username);
      leader.set("score", score);
      leader.set("password", "none");
      leader.save();

      const leaders_query = new Parse.Query(Leader);
      leaders_query.descending("score");
      let leaders = await leaders_query.find();

      if (leaders.length > 4) {
        const remove = await leaders_query.ascending("score").first();
        remove.destroy().then(() => {
          //console.log(remove.get('username'));
          this.reRenderLeaders();
        })
      }
    } catch (error) {
      console.error(error);
    }

  }
  
  async reRenderLeaders() {
    const Leader = Parse.Object.extend('Leader');
    const leaders_query = new Parse.Query(Leader);
    leaders_query.descending("score");
    const leaders = await leaders_query.find();

    let hs = await leaders_query.first();
    this.setState({highscore: hs.get('score'), leaders: []});

    leaders.forEach((obj) => {
      const mapData = async () => {
        this.setState(state => {
          const leaders = [...state.leaders, [obj.id, obj.get('username'), obj.get('score')] ];
          return {
            leaders,
          };
        })
      }
      mapData();
    })
  }

  async componentDidMount() {
    this.reRenderLeaders();
  }

  // This code is for using expressapi and mongo
  // async componentDidMount() {
  //   const url = `/api/leaders/`;
  //   const response = await fetch(url);
  //   const api_data = await response.json();
  //   console.log(api_data);
  //   api_data.forEach((obj) => {
  //     const mapData = async () => {
  //       this.setState(state => {
  //         const leaders = [...state.leaders, [obj._id, obj.username, obj.score] ];
  //         return {
  //           leaders,
  //         };
  //       })
  //     }
  //     mapData();
  //   })
  // }

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
              resetGame= {() => this.resetGame()}
              addLeader= {(username, score) => this.addLeader(username, score)}
              score= {this.state.score}
              highscore= {this.state.highscore}/>
        </div>
        <div className="high-score-list">
          <h3>High Scores</h3>
          <Leaderboard leaders= {this.state.leaders}/>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

export default Game;
