import { combineReducers } from 'redux'
import {
  SELECT_REDDIT, INVALIDATE_REDDIT,
  REQUEST_POSTS, RECEIVE_POSTS, NEXT_PAGE, PREV_PAGE, TOP_PAGE
} from '../actions'

function selectedReddit(state = 'reactjs', action) {
  switch (action.type) {
    case SELECT_REDDIT:
      return action.reddit
    default:
      return state
  }
}

function posts(state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) {
  switch (action.type) {
    case INVALIDATE_REDDIT:
      return Object.assign({}, state, {
        didInvalidate: true
      })
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      })
    case RECEIVE_POSTS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      })
    default:
      return state
  }
}

function postsByReddit(state = {}, action) {
  switch (action.type) {
    case INVALIDATE_REDDIT:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        [action.reddit]: posts(state[action.reddit], action)
      })
    default:
      return state
  }
}

function crtl(state = {}, action) {
  console.log("crtl");
  console.log(action);

  if (Object.keys(state).length !== 0) {
    var start = state.start;
    switch (action.type) {
      case NEXT_PAGE:
        start = start + 100;
        if (start > 9000) {
          start = 8900;
        }
        break;
      case PREV_PAGE:
        start = start - 100;
        if (start < 0) {
          start = 0;
        }
        break;
      case TOP_PAGE:
        start = 0;
        break;
    }
    var end = start + 100;
    return Object.assign({}, state, {
      "start": start,
      "end": end
    });
  }

  return Object.assign({}, state, {
    "start": 0,
    "end": 100
  });
}

const rootReducer = combineReducers({
  postsByReddit,
  selectedReddit,
  crtl
})

export default rootReducer
