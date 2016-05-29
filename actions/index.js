import fetch from 'isomorphic-fetch'

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_REDDIT = 'SELECT_REDDIT'
export const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT'
export const NEXT_PAGE = 'NEXT_PAGE'
export const PREV_PAGE = 'PREV_PAGE'
export const TOP_PAGE = 'TOP_PAGE'

export function selectReddit(reddit) {
  return {
    type: SELECT_REDDIT,
    reddit
  }
}

export function invalidateReddit(reddit) {
  return {
    type: INVALIDATE_REDDIT,
    reddit
  }
}

function requestPosts(reddit) {
  return {
    type: REQUEST_POSTS,
    reddit
  }
}

function receivePosts(reddit, json) {
  return {
    type: RECEIVE_POSTS,
    reddit: reddit,
    posts: json,
    receivedAt: Date.now()
  }
}

function fetchPosts(getState,reddit) {
  return dispatch => {
    console.log(reddit);
    dispatch(requestPosts(reddit));
    var state=getState();
    var start=state.crtl.start;
    var end=state.crtl.end;
    var url=`/rss?start=`+start+`&end=`+end;
    console.log(url);
    return fetch(url)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(reddit, json)))
  }
}

function shouldFetchPosts(state, reddit) {
  console.log(state);
  const posts = state.postsByReddit[reddit]
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate
}

export function nextPage(reddit) {
  return {
    type: NEXT_PAGE,
    reddit
  }
}

export function topPage(reddit) {
  return {
    type: TOP_PAGE,
    reddit
  }
}

export function prevPage(reddit) {
  return {
    type: PREV_PAGE,
    reddit
  }
}

export function fetchPostsIfNeeded(reddit) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), reddit)) {
      return dispatch(fetchPosts(getState,reddit))
    }
  }
}
