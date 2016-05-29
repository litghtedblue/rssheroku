import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectReddit, fetchPostsIfNeeded, invalidateReddit, topPage, nextPage, prevPage } from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
    this.handleTopClick = this.handleTopClick.bind(this)
    this.handleNextClick = this.handleNextClick.bind(this)
    this.handlePrevClick = this.handlePrevClick.bind(this)
  }

  componentDidMount() {
    const { dispatch, selectedReddit } = this.props
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedReddit !== this.props.selectedReddit) {
      const { dispatch, selectedReddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedReddit))
    }
  }

  handleChange(nextReddit) {
    this.props.dispatch(selectReddit(nextReddit))
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  handleTopClick(e) {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(topPage(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }
  
  handleNextClick(e) {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(nextPage(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  handlePrevClick(e) {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(prevPage(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  render() {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0;
    const crtl = this.props.crtl;
    return (
      <div>
        {/*
        <Picker value={selectedReddit}
                onChange={this.handleChange}
                options={[ 'reactjs2', 'frontend' ]} />
       */}
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString() }.
              {' '} {"[" + crtl.start + "-" + crtl.end + "]"}
            </span>
          }
          {!isFetching &&
            <span>
              <a href="#"
                onClick={this.handleRefreshClick}>
                Refresh
              </a>{" "}
              <a href="#"
                onClick={this.handleTopClick}>
                Top
              </a>{" "}
              <a href="#"
                onClick={this.handleNextClick}>
                Next
              </a>{" "}
              <a href="#"
                onClick={this.handlePrevClick}>
                Prev
              </a>               
            </span>
          }
        </p>
        {isEmpty
          ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <table className="titlelist">
            <tbody>
              <Posts posts={posts} />
            </tbody>
          </table>
        }
      </div>
    )
  }
}

App.propTypes = {
  selectedReddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  ctrl: PropTypes.object
}

function mapStateToProps(state) {
  const { selectedReddit, postsByReddit, crtl } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByReddit[selectedReddit] || {
    isFetching: true,
    items: []
  }

  var result = {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated,
    crtl
  }

  return result;
}

export default connect(mapStateToProps)(App)
